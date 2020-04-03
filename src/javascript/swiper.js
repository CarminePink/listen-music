class Swiper {

   constructor(node) {
      let timeID = null
      let initX
      let newX
      let root = typeof node === 'string' ? document.querySelector('node') : node
      let eventBus = {swipeLeft: [], swipeRight: []}

      root.ontouchstart = (e) => {
         initX = e.touches[0].clientX
      }
      root.ontouchmove = (e) => {
         if (timeID) {
            window.clearInterval(timeID)
         }
         timeID = setInterval(() => {
            newX = e.touches[0].clientX
            if (newX - initX >= 20) {
               eventBus.swipeLeft.forEach((item, index) => item())
            } else if (initX - newX >= 20) {
               eventBus.swipeRight.forEach((item, index) => item())
            }
            window.clearInterval(timeID)
         }, 100)

      }
      this.on = function (type, fn) {
         if (eventBus[type]) {
            eventBus[type].push(fn)
         }
      }
      this.off = function (type, fn) {
         const index = eventBus[type].indexOf(fn)
         if (index >= 0) {
            eventBus[type].splice(index, 1)
         }
      }
   }

}

export default Swiper