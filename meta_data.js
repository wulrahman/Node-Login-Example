const metascraper = require('metascraper')([
  require('metascraper-amazon')(),
  require('metascraper-audio')(),
  require('metascraper-author')(),
  require('metascraper-clearbit')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  // require('@metascraper/helpers')(),
  require('metascraper-image')(),
  require('metascraper-iframe')(),
  require('metascraper-lang')(),
  require('metascraper-logo')(),
  require('metascraper-logo-favicon')(),
  require('metascraper-media-provider')(),
  require('metascraper-publisher')(),
  require('metascraper-readability')(),
  require('metascraper-soundcloud')(),
  require('metascraper-title')(),
  require('metascraper-uol')(),
  require('metascraper-url')(),
  require('metascraper-spotify')(),
  require('metascraper-video')(),
  require('metascraper-youtube')(),
  require('metascraper-address')(),
  require('@samirrayani/metascraper-shopping')(),
])

const cheerio = require('cheerio')

return_data = {
    meta_data:{},
    dom:{}
  }


exports.meta_data = async function meta_data(content, callback){
    url = content.url;
    html = content.html;
    return_data.meta_data = await metascraper({ html, url });
    return_data.dom = await cheerio.load(html)
    callback(return_data);
}



function unique_array(array) {
    array = Array.from(new Set(array.map(a => a))).map(value => {
        return array.find( a => a === value)
    })
    return array;
}

function arr_diff (a1, a2) {

    var a = [], diff = [];

    for (var i = 0; i < a1.length; i++) {
        a[a1[i]] = true;
    }

    for (var i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        } else {
            a[a2[i]] = true;
        }
    }

    for (var k in a) {
        diff.push(k);
    }

    return diff;
}