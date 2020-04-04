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
      this.currenIndex = 0
      this.audio = new Audio()
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
      let swipe = new Swiper(document.querySelector('.panels'))
      swipe.on('swipeLeft', () => {
         const panelPage = document.querySelector('.panels')
         panelPage.classList.remove('panel2')
         panelPage.classList.add('panel1')
      })
      swipe.on('swipeRight', () => {
         const panelPage = document.querySelector('.panels')
         panelPage.classList.remove('panel1')
         panelPage.classList.add('panel2')
      })
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

   playNextSong() {
      const length = this.songList.length
      this.currenIndex = (length + this.currenIndex - 1) % length
      this.audio.src = this.songList[this.currenIndex].url
      this.audio.oncanplaythrough = () => this.audio.play()
      this.renderSong()
      this.playStatus()
   }

   playPreSong() {
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
         })

   }

   renderSong() {
      const el = this.songList[this.currenIndex]
      console.log(el)
      const header = this.root.querySelector('.header h1')
      const author = this.root.querySelector('.header p')
      header.innerText = el.title
      author.innerText = el.author + '-' + el.albumn
      this.loadLyrics()
      this.lyricToCenter(this.root.querySelector('.container .current'))
   }

   lyricToCenter(node) {
      const el = this.root.querySelector('.panels .container')
      const setTop = node.offsetTop
      const setHeight = this.root.querySelector('.panels').offsetHeight / 2
      const offSet = setTop - setHeight
      const moveSet = offSet > 0 ? offSet : 0
      el.style.transform = `translateY(-${moveSet}px)`
      console.log(this.root.querySelectorAll('.container p'))
   }
}

window.p = new Player('#player')