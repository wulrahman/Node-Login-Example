const isReachable = require('is-reachable');
const valid_url = require('valid-url');
const url_exists = require('url-exists');
const dns = require('dns');
const got = require('got')

exports.append_scheme = function append_scheme(main_url) {
        if (!main_url.match(/^[a-zA-Z]+:\/\//)) {
            main_url = 'http://' + main_url;
        }
        return new URL(main_url);
    } 
  
exports.content_request = async function content_request(target_url, content) {
    const { body: html, url } = await got(target_url);
    html_mod = html.replace(/(<style((.|\n|\r)*?)<\/style>)/g, ' ');
    content({html:html_mod, url:url})
  };

exports.hostnameExists = async function hostnameExists(hostname, resolve) {
    dns.lookup(hostname, async (error) => {
        if(await isReachable('google.com:443')) {
            secure_connection = true;
            port = 443;
            protocol = "https:"
        }
        else {
            secure_connection = false;
            if(await isReachable('google.com:80')) {
                port = 80;
                protocol = "http:"
            }
            else if(await isReachable('google.com:23')) {
                port = 21;
                protocol = "ftp:"
            }
            else {
                port = "";
                protocol = "file:"
            }
        }
        resolve({hostname, exists: !error, secure_connection:secure_connection, port:port, protocol:protocol});
    });
  }

exports.valid_main_url = async function valid_main_url(main_url, resolve, status) {
    url_parse = new URL(main_url)
    console.log(url_parse);
    url_parse.protocol = resolve.protocol;
    main_url = url_parse.href;
    if(valid_url.isUri(main_url)) {
        url_exists(main_url, function(error, exists) {
            if(error) {
                throw error;
            }
            else {
                status({exist:exists, url_valid:true, main_url:main_url});
            }
        });
    }
    else {
        status({exist:false, url_valid:false, main_url:main_url});
    }
}
