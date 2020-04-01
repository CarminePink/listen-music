import './icons.js'
//http://carminepink.xyz/data-mock/huawei-music/music-list.json
//https://jirengu.github.io/data-mock/huawei-music/music-list.json
console.log('hi')

const $ = (selector) => {
   document.querySelector(selector)
}
const $$ = (selector) => {
   document.querySelectorAll(selector)
}

class Player {
   constructor(node) {
      this.root = typeof node === 'string' ? $(node) : node
      this.songList = []
      this.currenIndex = 0
      this.start()
   }

   bind() {
   }
   start(){
      fetch('http://carminepink.xyz/data-mock/huawei-music/music-list.json')
         .then(res=>res.json())
         .then(data=>{
            console.log(data)
            this.songList = data
         })
   }
}

new Player('#player')