import './icons.js'
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
         })
   }

   bind() {
      let self = this
      const playOrPauseButton = this.root.querySelector('.btn-play-pause')
      playOrPauseButton.onclick = function () {
         console.log(this)
         if (this.classList.contains('playing')) {
            self.audio.pause()
            this.classList.remove('playing')
            this.classList.add('pause')
            this.querySelector('use').setAttribute('xlink:href', '#icon-play')

         } else if (this.classList.contains('pause')) {
            self.audio.play()
            this.classList.remove('pause')
            this.classList.add('playing')
            this.querySelector('use').setAttribute('xlink:href', '#icon-pause')
         }
      }
   }

   playSong() {
   }
}

new Player('#player')