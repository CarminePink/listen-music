import './icons.js'
import Swiper from './swiper.js'
//http://carminepink.xyz/data-mock/huawei-music/music-list.json

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
      this.volumePercnt = 0.5
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
            this.audio.volume = 0.5
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
      orderButton.onclick = () => {
         const songListOrder = this.root.querySelector('.selectPlayOrder')
         songListOrder.removeChild(songListOrder.children[1])
         if (orderButton.classList.contains('ordering')) {
            this.switchButtonOrder('ordering', 'inordering', '#icon-inorder')
            this.switchSongListOrder('order', 'inOrder', '#icon-suiji')
            this.switchOrderText('随机播放')
            this.songOrder = 'inorder'
         } else if (orderButton.classList.contains('inordering')) {
            this.switchButtonOrder('inordering', 'singling', '#icon-single')
            this.switchSongListOrder('inOrder', 'single', '#icon-danquxunhuan')
            this.switchOrderText('单曲循环')
            this.songOrder = 'single'
         } else if (orderButton.classList.contains('singling')) {
            this.switchButtonOrder('singling', 'ordering', '#icon-circle')
            this.switchSongListOrder('single', 'order', '#icon-liebiaoxunhuan')
            this.switchOrderText('列表循环')
            this.songOrder = 'order'
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
         //e.preventDefault()
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
         this.renderSonglist()
      }
      cover.ontouchstart = (e) => {
         e.preventDefault()
         musicList.classList.remove('displaying')
         musicList.classList.add('notDisplay')
         musicList.style.display = 'none'
         cover.style.display = 'none'
      }

      const songListOrder = this.root.querySelector('.selectPlayOrder')
      const songListOrderSvg = songListOrder.children[0]
      songListOrder.onclick = () => {
         songListOrder.removeChild(songListOrder.children[1])
         if (songListOrderSvg.classList.contains('order')) {
            this.switchSongListOrder('order', 'inOrder', '#icon-suiji')
            this.switchButtonOrder('ordering', 'inordering', '#icon-inorder')
            this.switchOrderText('随机播放')
            this.songOrder = 'inorder'
         } else if (songListOrderSvg.classList.contains('inOrder')) {
            this.switchSongListOrder('inOrder', 'single', '#icon-danquxunhuan')
            this.switchButtonOrder('inordering', 'singling', '#icon-single')
            this.switchOrderText('单曲循环')
            this.songOrder = 'single'
         } else if (songListOrderSvg.classList.contains('single')) {
            this.switchSongListOrder('single', 'order', '#icon-liebiaoxunhuan')
            this.switchButtonOrder('singling', 'ordering', '#icon-circle')
            this.switchOrderText('列表循环')
            this.songOrder = 'order'
         }

      }

      const volumeBar = this.root.querySelector('.volume-bar')
      const volumeEl = this.root.querySelector('.volume')
      const volumePro = this.root.querySelector('.volume-progress')
      const volumeSvg = this.root.querySelector('.volume-icon')
      volumeBar.ontouchstart = (e) => {
         e.preventDefault()
         const posX = e.touches[0].clientX
         const volumeOffSetLeft = volumeEl.offsetLeft
         let setLeftSum = posX - volumeOffSetLeft
         const percenX = (setLeftSum / volumeBar.offsetWidth) * 100
         this.volumePercnt = (setLeftSum / volumeBar.offsetWidth)
         volumePro.style.width = percenX + '%'
      }
      volumeBar.ontouchend = (e) => {
         if(this.volumePercnt >=0){
            if(volumeSvg.classList.contains('mute')){
               this.adjustVolume('mute','notMute','#icon-volume')
               this.audio.muted = false
            }
            this.audio.volume = this.volumePercnt
         }
         if(this.volumePercnt <= 0){
            this.adjustVolume('notMute','mute','#icon-mute')
            this.audio.muted = true
         }
      }
      volumeSvg.onclick = () => {
         if (volumeSvg.classList.contains('notMute')) {
            this.adjustVolume('notMute','mute','#icon-mute')
            this.audio.muted = true
            volumePro.style.width = 0 + '%'
         } else {
            this.adjustVolume('mute','notMute','#icon-volume')
            this.audio.muted = false
            volumePro.style.width =(this.volumePercnt)*100 + '%'
         }

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
            //console.log(data.lrc.lyric)
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
      //console.log(lyricsRes)
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

   renderSonglist() {
      const listTitle = this.root.querySelector('.listHeader span')
      const currentSong = this.songList[this.currenIndex].title
      let fragment = document.createDocumentFragment()
      listTitle.innerText = `(${this.songList.length})`
      this.songList.forEach((item, index) => {
         const elDiv = document.createElement('div')
         const elP = document.createElement('p')
         const elSpan = document.createElement('span')
         elP.innerText = item.title
         elSpan.innerText = '-' + item.author
         elDiv.appendChild(elP)
         elDiv.appendChild(elSpan)
         fragment.appendChild(elDiv)
         elDiv.onclick = () => {
            this.lyricIndex = -1
            this.currenIndex = item.id
            this.audio.src = item.url
            this.audio.oncanplaythrough = () => this.audio.play()
            this.renderSong()
            this.playStatus()
            this.redCurrentSong()
         }
         if (elP.innerText === currentSong) {
            elDiv.style.color = 'red'
            elSpan.style.color = 'red'
            elDiv.appendChild(this.createSvg())
         }
      })
      const el = this.root.querySelector('.playLists')
      el.innerText = ''
      el.appendChild(fragment)

   }

   createSvg() {
      const elSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      elSvg.innerHTML = `<svg t="1586944292017" class="icon" viewBox="0 0 1298 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11102" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><style type="text/css"></style></defs><path d="M51.2 344.747 51.2 686.08c0 37.547 30.72 68.267 68.267 68.267l170.667 0L290.134 276.48 119.467 276.48C81.92 276.48 51.2 307.2 51.2 344.747zM631.467 71.68 358.4 232.107l0 570.027L631.467 962.56c37.547 0 68.267-30.72 68.267-68.267L699.734 143.36C699.733 102.4 669.013 71.68 631.467 71.68z" fill="#d81e06" p-id="11103"></path><path d="M895.151 864.349c-14.242 0-28.484-9.495-33.232-23.737-7.121-18.99 2.374-37.979 21.363-45.1 116.311-45.1 189.896-154.29 189.896-280.096S999.594 280.42 883.283 235.319c-18.99-7.121-28.484-28.484-21.363-45.1 7.121-18.99 28.484-28.484 45.1-21.363 142.422 54.595 234.996 192.269 234.996 346.559s-92.574 289.591-234.996 346.559C904.646 864.349 899.898 864.349 895.151 864.349zM847.677 710.058c-14.242 0-28.484-9.495-33.232-26.111-4.747-18.99 4.747-37.979 23.737-45.1 54.595-16.616 92.574-66.463 92.574-123.432s-37.979-109.19-92.574-123.432c-18.99-4.747-28.484-26.111-23.737-45.1 4.747-18.99 26.111-28.484 45.1-23.737 83.079 23.737 142.422 104.443 142.422 192.269 0 90.2-56.969 166.159-142.422 192.269C854.798 707.685 852.425 710.058 847.677 710.058z" fill="#d81e06" p-id="11104"></path></svg>`
      return elSvg
   }

   redCurrentSong() {
      const elDivArr = this.root.querySelectorAll('.playLists div')
      const currentSong = this.songList[this.currenIndex].title
      if (elDivArr) {
         elDivArr.forEach((item, index) => {
            const content = item.children[0].textContent
            item.style.color = 'black'
            item.children[1].style.color = 'black'
            if (item.children[2]) {
               item.removeChild(item.children[2])
            }
            if (content === currentSong) {
               item.style.color = 'red'
               item.children[1].style.color = 'red'
               item.appendChild(this.createSvg())
            }
         })
      }

   }

   switchButtonOrder(rmClass, addClass, iconID) {
      const orderButton = this.root.querySelector('.btn-order')
      const orderSvg = orderButton.querySelector('use')
      orderButton.classList.remove(rmClass)
      orderButton.classList.add(addClass)
      orderSvg.setAttribute('xlink:href', iconID)

   }

   switchSongListOrder(rmClass, addClass, iconID) {
      const songListOrder = this.root.querySelector('.selectPlayOrder')
      const songListOrderSvg = songListOrder.children[0]
      const songListOrderUse = songListOrderSvg.querySelector('use')
      songListOrderSvg.classList.remove(rmClass)
      songListOrderSvg.classList.add(addClass)
      songListOrderUse.setAttribute('xlink:href', iconID)
   }

   switchOrderText(content) {
      const songListOrder = this.root.querySelector('.selectPlayOrder')
      const el = document.createElement('span')
      el.innerText = content
      songListOrder.appendChild(el)
   }

   adjustVolume(rmClass,addClass,iconID){
      const volumeSvg = this.root.querySelector('.volume-icon')
      volumeSvg.classList.remove(rmClass)
      volumeSvg.classList.add(addClass)
      volumeSvg.querySelector('use').setAttribute('xlink:href', iconID)
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