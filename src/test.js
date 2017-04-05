(function () {
  var later = document.getElementById('later')
  var interval = document.getElementById('interval')
  setTimeout(function () {
    later.innerHTML =
      'This is just a test, if tampermonkey works as expected. Some cities: Seattle, London, New York!'
  }, 100)
  var counter = 0
  setInterval(function () {
    var cities = [
      ['Amsterdam', 'Berlin', 'Paris'],
      ['Peking', 'Beijing', 'Singapore'],
      ['Cairo', 'Johannesburg', 'Lagos']
    ]
    interval.innerHTML = 'This is another test, which is re-updated every 250ms. Some more cities: ' + cities[counter % 3]
    counter++
  }, 250)
})()
