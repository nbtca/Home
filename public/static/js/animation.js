var animationElements = []
var imageElements = []
var animationElementName = ".small-load"

// Hookable function
var loadAnimation = function (item) {
  const img = new Image()
  img.src = item.children[0].children[0].src
  img.onload = function () {
    item.classList.remove("small-load", "medium-load", "large-load")
    item.classList.add("small-loaded", "medium-loaded", "large-loaded")
  }
}

// Hookable function
var loadImage = function (index) {
  if (index >= imageElements.length) return
  const item = imageElements[index]
  const image = new Image()
  if(!item.src){
    loadImage(index + 1)
    return
  }
  image.src = item.src
  image.onload = function () {
    loadImage(index + 1)
  }
}

function initImage() {
  // get all the images with data-src attribute
  // imageElements = document.querySelectorAll("img[data-src]")
  imageElements = document.querySelectorAll(".image-load, .small-load, .medium-load, .large-load")
  // load the images one by one
  loadImage(0)

  animationElements = document.querySelectorAll(animationElementName)
  // load the images which are in the viewport
  viewPortLoad(0)
  const debouncedHandleScroll = debounce(lazyAnimation, 10)
  // add the event listener
  window.addEventListener("scroll", debouncedHandleScroll)
}

function viewPortLoad(index) {
  if (index >= animationElements.length) return
  const item = animationElements[index]
  if (!isElementInView(item)) {
    viewPortLoad(index + 1)
    return
  }

  loadAnimation(item)
  viewPortLoad(index + 1)
}

function lazyAnimation() {
  images = document.querySelectorAll(animationElementName)
  viewPortLoad(0)
}

// check if the element is in the viewport
function isElementInView(element) {
  const rect = element.getBoundingClientRect()
  const elementTop = rect.top
  const elementBottom = rect.bottom
  return (elementTop >= 0 && elementBottom - 200 <= window.innerHeight)
}

function debounce(fn, delay) {
  let timer = null
  return function () {
    const context = this
    const args = arguments
    clearTimeout(timer)
    timer = setTimeout(function () {
      fn.apply(context, args)
    }, delay)
  }
}
