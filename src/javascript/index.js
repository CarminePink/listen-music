import './icons.js'
import Swiper from './swiper.js'
//http://carminepink.xyz/data-mock/huawei-music/music-list.json
//https://jirengu.github.io/data-mock/huawei-music/music-list.json

const $ = (selector) => {
   document.querySelector(selector)
}
const $$ = (selector) => {
   document.querySelectorAll(selector)
}

class Player {
   constructor(node) {
      this.root = typeof node === 'string' ? document.querySelector(node) : node
      this.songList = []
      this.songOrder = 'order'
      this.currenIndex = 0
      this.audio = new Audio()
      this.lyricIndex = -1
      this.lyricsArr = []
      this.posArr = []
      this.barPosArr = []
      this.timeArr = []
      this.barTimeArr = []
      this.start()
      this.bind()
   }

   start() {
      fetch('http://carminepink.xyz/data-mock/huawei-music/music-list.json')
         .then(res => res.json())
         .then(data => {
            console.log(data)
            this.songList = data
            this.audio.src = this.songList[this.currenIndex].url
            this.renderSong()
         })
   }

   bind() {
      let self = this
      const playOrPauseButton = this.root.querySelector('.btn-play-pause')
      playOrPauseButton.onclick = function () {
         if (this.classList.contains('playing')) {
            self.audio.pause()
            this.classList.remove('playing')
            this.classList.add('pausing')
            this.querySelector('use').setAttribute('xlink:href', '#icon-play')
         } else if (this.classList.contains('pausing')) {
            self.audio.play()
            this.classList.remove('pausing')
            this.classList.add('playing')
            this.querySelector('use').setAttribute('xlink:href', '#icon-pause')
         }
      }

      const nextButton = this.root.querySelector('.btn-next')
      const preButton = this.root.querySelector('.btn-pre')
      nextButton.onclick = function () {
         self.playNextSong()
      }
      preButton.onclick = function () {
         self.playPreSong()
      }

      const orderButton = this.root.querySelector('.btn-order')
      orderButton.onclick = function () {
         if (this.classList.contains('ordering')) {
            this.classList.remove('ordering')
            this.classList.add('inordering')
            this.querySelector('use').setAttribute('xlink:href', '#icon-inorder')
            self.songOrder = 'inorder'
         } else if (this.classList.contains('inordering')) {
            this.classList.remove('inordering')
            this.classList.add('singling')
            this.querySelector('use').setAttribute('xlink:href', '#icon-single')
            self.songOrder = 'single'
         } else if (this.classList.contains('singling')) {
            this.classList.remove('singling')
            this.classList.add('ordering')
            this.querySelector('use').setAttribute('xlink:href', '#icon-circle')
            self.songOrder = 'order'
         }

      }


      let swipe = new Swiper(document.querySelector('.panels'))
      swipe.on('swipeLeft', () => {
         const panelPage = document.querySelector('.panels')
         panelPage.classList.remove('panel2')
         panelPage.classList.add('panel1')
         self.root.querySelectorAll('.balls span')[1].classList.remove('current')
         self.root.querySelectorAll('.balls span')[0].classList.add('current')
      })
      swipe.on('swipeRight', () => {
         const panelPage = document.querySelector('.panels')
         panelPage.classList.remove('panel1')
         panelPage.classList.add('panel2')
         self.root.querySelectorAll('.balls span')[0].classList.remove('current')
         self.root.querySelectorAll('.balls span')[1].classList.add('current')
      })

      const progress = this.root.querySelector('.progress')
      const proBall = this.root.querySelector('.progress .progress-ball')
      const bar = this.root.querySelector('.bar')
      const barSetLeft = bar.offsetLeft
      const barSetWidth = bar.offsetWidth
      proBall.ontouchstart = (e) => {
         e.preventDefault()
         e.stopPropagation()
         const posX = e.touches[0].clientX
      }
      proBall.ontouchmove = (e) => {
         e.preventDefault()
         e.stopPropagation()
         const newPosX = e.touches[0].clientX
         this.posArr = [newPosX]
         let moveX = newPosX - barSetLeft
         const percentX = (moveX / barSetWidth) * 100 + '%'
         progress.style.width = percentX
      }
      proBall.ontouchend = (e) => {
         e.preventDefault()
         e.stopPropagation()
         this.timeArr = []
         const percent = ((this.posArr[0] - barSetLeft) / barSetWidth)
         const num = Math.fround(percent)
         this.audio.currentTime = this.audio.duration * num
         this.playStatus()
         const el = this.root.querySelector('.actions .btn-play-pause')
         if (el.classList.contains('playing')) {
            this.audio.oncanplaythrough = () => this.audio.play()
            this.locateProgrssLyric(this.timeArr)
         }
      }
      bar.ontouchstart = (e) => {
         const posX = e.touches[0].clientX
         this.barPosArr = [posX]
         if (posX - barSetLeft >= 10) {
            const percentX = ((posX - barSetLeft) / barSetWidth) * 100 + '%'
            progress.style.width = percentX
         }
      }
      bar.ontouchend = (e) => {
         e.preventDefault()
         this.barTimeArr = []
         this.audio.currentTime = this.audio.duration * ((this.barPosArr[0] - barSetLeft) / barSetWidth)
         this.playStatus()
         const el = this.root.querySelector('.actions .btn-play-pause')
         if (el.classList.contains('playing')) {
            this.audio.oncanplaythrough = () => this.audio.play()
            this.locateProgrssLyric(this.barTimeArr)
         }
      }


      const musicListButton = this.root.querySelector('.btn-music-list')
      const musicList = this.root.querySelector('.songList')
      const cover = this.root.querySelector('.coverBackground')
      musicListButton.onclick = (e) => {
         musicList.classList.remove('notDisplay')
         musicList.classList.add('displaying')
         musicList.style.display = 'block'
         cover.style.display = 'block'
         cover.style.height = '100vh'

      }
      cover.ontouchstart = (e)=>{
         e.preventDefault()
         musicList.classList.remove('displaying')
         musicList.classList.add('notDisplay')
         musicList.style.display = 'none'
         cover.style.display = 'none'
      }


      this.audio.ontimeupdate = function () {
         //console.log(parseInt(self.audio.currentTime * 1000))
         self.locateLyric()
         self.setProgressBar()
         if (self.audio.ended === true) {
            self.setSongOrder()
         }
      }

   }

   playStatus() {
      const playOrpauseButton = this.root.querySelector('.btn-play-pause')
      const status = playOrpauseButton.querySelector('use').getAttribute('xlink:href')
      if (playOrpauseButton.classList.contains('pausing')) {
         playOrpauseButton.classList.remove('pausing')
         playOrpauseButton.classList.add('playing')
      }
      if (status === '#icon-pause') {
      } else if (status === '#icon-play') {
         playOrpauseButton.querySelector('use').setAttribute('xlink:href', '#icon-pause')
      }
   }

   playPreSong() {
      this.lyricIndex = -1
      const length = this.songList.length
      this.currenIndex = (length + this.currenIndex - 1) % length
      this.audio.src = this.songList[this.currenIndex].url
      this.audio.oncanplaythrough = () => this.audio.play()
      this.renderSong()
      this.playStatus()
   }

   playNextSong() {
      this.lyricIndex = -1
      const length = this.songList.length
      this.currenIndex = (length + this.currenIndex + 1) % length
      this.audio.src = this.songList[this.currenIndex].url
      this.audio.oncanplaythrough = () => this.audio.play()
      this.renderSong()
      this.playStatus()
   }

   loadLyrics() {
      const el = this.songList[this.currenIndex]
      fetch(el.lyric)
         .then(res => res.json())
         .then(data => {
            console.log(data.lrc.lyric)
            this.setLyrics(data.lrc.lyric)
         })

   }

   renderSong() {
      const el = this.songList[this.currenIndex]
      console.log(el)
      const header = this.root.querySelector('.header h1')
      const author = this.root.querySelector('.header p')
      header.innerText = el.title
      author.innerText = el.author + '-' + el.albumn
      this.audio.onloadedmetadata = () => {
         const songTime = this.audio.duration
         this.root.querySelector('.time-end').innerText = this.formateTime(songTime)
      }

      this.loadLyrics()
      //this.lyricToCenter(this.root.querySelector('.container .current'))
   }

   lyricToCenter(node) {
      const el = this.root.querySelector('.panels .container')
      const setTop = node.offsetTop
      const setHeight = this.root.querySelector('.panels').offsetHeight / 2
      const offSet = setTop - setHeight
      const moveSet = offSet > 0 ? offSet : 0
      el.style.transform = `translateY(-${moveSet}px)`

      this.root.querySelectorAll('.container p')
         .forEach((item) => item.classList.remove('current')
         )
      node.classList.add('current')
   }

   setLyrics(lyrics) {
      let fragment = document.createDocumentFragment()
      let lyricsRes = []
      this.lyricsArr = lyricsRes
      lyrics.split(/\n/)
         .filter((item) => item.match(/\[.+?\]/))
         .forEach((line) => {
            let str = line.replace(/\[.+?\]/g, '')
            line.match(/\[.+?\]/g).forEach((t) => {
               t = t.replace(/[\[\]]/g, '')
               let time = parseInt(t.slice(0, 2)) * 60 * 1000 +
                  parseInt(t.slice(3, 5)) * 1000 +
                  parseInt(t.slice(6))
               lyricsRes.push([time, str])
            })
         })
      lyricsRes.forEach((item, index) => {
         if (item[1] === '') {
            lyricsRes.splice(index, 1)
         }
      })
      lyricsRes.sort((a, b) => {
         if (a[0] > b[0]) {
            return 1
         } else {
            return -1
         }
      })
      console.log(lyricsRes)
      lyricsRes
         .filter((item) => item[1].trim() !== '')
         .forEach((item) => {
            const el = document.createElement('p')
            el.setAttribute('song-time', item[0])
            el.innerText = item[1]
            fragment.appendChild(el)
         })

      const el = this.root.querySelector('.container')
      el.innerText = ''
      el.appendChild(fragment)

   }

   locateLyric() {
      const currentLyricTime = parseInt(this.audio.currentTime * 1000)
      const nextLyricTime = this.lyricsArr[this.lyricIndex + 1] ? this.lyricsArr[this.lyricIndex + 1][0] : ''
      if (currentLyricTime > nextLyricTime && this.lyricIndex < this.lyricsArr.length - 1) {
         this.lyricIndex++
         let el = this.root.querySelector(`[song-time ="${this.lyricsArr[this.lyricIndex][0]}"]`)
         console.log(el)
         console.log(el.offsetTop)
         this.lyricToCenter(el)
         this.root.querySelectorAll('.lyrics p')[0].innerText = this.lyricsArr[this.lyricIndex] ? this.lyricsArr[this.lyricIndex][1] : ''
         this.root.querySelectorAll('.lyrics p')[1].innerText = this.lyricsArr[this.lyricIndex + 1] ? this.lyricsArr[this.lyricIndex + 1][1] : ''
      }
   }

   locateProgrssLyric(arr) {
      console.log(this.audio.currentTime)
      this.lyricsArr.forEach((item, index) => {
         if (item[0] > (this.audio.currentTime * 1000)) {
            arr.push(item[0])
         }
      })
      if (arr.length > 1) {
         arr.splice(1, arr.length - 1)
         console.log(arr)
         const lyIndex = this.lyricsArr.findIndex((item) => item[0] === arr[0])
         console.log(lyIndex)
         this.lyricIndex = lyIndex - 1
      }
      this.root.querySelectorAll('.lyrics p').forEach((item) => item.classList.remove('current'))
      this.root.querySelectorAll('.lyrics p')[0].innerText = this.lyricsArr[this.lyricIndex] ? this.lyricsArr[this.lyricIndex][1] : ''
      this.root.querySelectorAll('.lyrics p')[1].innerText = this.lyricsArr[this.lyricIndex + 1] ? this.lyricsArr[this.lyricIndex + 1][1] : ''
      this.root.querySelectorAll('.lyrics p')[0].classList.add('current')
   }

   setSongOrder() {
      if (this.songOrder === 'order') {
         const length = this.songList.length
         this.currenIndex = (length + this.currenIndex + 1) % length
         this.audio.src = this.songList[this.currenIndex].url
         this.audio.oncanplaythrough = () => this.audio.play()
         this.lyricIndex = -1
         this.renderSong()
         this.playStatus()
      } else if (this.songOrder === 'single') {
         this.currenIndex = this.currenIndex
         this.audio.src = this.songList[this.currenIndex].url
         this.audio.oncanplaythrough = () => this.audio.play()
         this.lyricIndex = -1
         this.renderSong()
         this.playStatus()
      } else if (this.songOrder === 'inorder') {
         const length = this.songList.length
         this.currenIndex = this.randomIndex(0, this.songList.length)
         this.audio.src = this.songList[this.currenIndex].url
         this.audio.oncanplaythrough = () => this.audio.play()
         this.lyricIndex = -1
         this.renderSong()
         this.playStatus()
      }
   }

   setProgressBar() {
      let timePercent = (this.audio.currentTime * 100) / this.audio.duration + '%'
      const el = this.root.querySelector('.area-bar .bar .progress')
      const initTime = this.root.querySelector('.time-start')
      el.style.width = timePercent
      initTime.innerText = this.formateTime(this.audio.currentTime)
   }

   formateTime(totalTime) {
      let minutes = parseInt(totalTime / 60)
      let seconds = parseInt(totalTime % 60)
      minutes = minutes >= 10 ? minutes : '0' + minutes
      seconds = seconds >= 10 ? seconds : '0' + seconds
      return minutes + ':' + seconds
   }

   randomIndex(min, max) {
      return Math.floor(Math.random() * (max - min) + min)
   }
}

new Player('#player')