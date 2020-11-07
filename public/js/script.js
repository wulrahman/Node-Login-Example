console.log("This is coming from script.js");
const socket = io("http://localhost:3000/");
const register_error = document.getElementById('register-error');
const login_error = document.getElementById('login-error');
const main_content = document.getElementById('main-content');
const loading = document.getElementById('loading');


const username = document.getElementById('username');
const password = document.getElementById('password');
const confirm_password = document.getElementById('confirm_password');
const email = document.getElementById('email');

const url = document.getElementById('url');

const main_nav = document.getElementById('main-nav');
if(main_nav) {
  const  nav_li  = main_nav.getElementsByClassName("active-button");
  nav_li_array = Array.prototype.slice.call(nav_li);
  nav_li_array.forEach(element => {
  	element.onclick = (event, index) => {
  		const  active_element  = main_nav.getElementsByClassName("active active-button");
  		active_element[0].classList.remove('active');
  		element.classList.add('active');
  	};
  });
}

const submit_button_login = document.getElementById('submit-button-login');
const submit_button_register = document.getElementById('submit-button-register');
const content_button = document.getElementById('content-button');


if(submit_button_login) {
  submit_button_login.onclick = (event) => {
    event.preventDefault();
    socket.emit('login-attempt', {username:username.value, password:password.value});
  };
}

if(content_button) {
  content_button.onclick = (event) => {
    event.preventDefault();
    loading.style.display = "grid";
    socket.emit('content-request', {url:url.value});
    main_content.innerHTML = "Please wait while we request data."
  };
}

if(submit_button_register) {
  submit_button_register.onclick = (event) => {
    event.preventDefault();
    socket.emit('register-attempt', {username:username.value, email:email.value, confirm_password:confirm_password.value, password:password.value});
  };
}

socket.on('set-cookie', cookie => {
  Object.keys(cookie.cookie).forEach(key => {
    setCookie(key, cookie.cookie[key], 100);
  });
});

socket.on('content', content => {
  main_content.innerHTML = "";
  main_json = removeEmptyOrNull(content.processed.meta_data);
  console.log(content);
  loading.style.display = "none";

  // for (var key in main_json) {
  //     var obj = main_json[key];
  //     var div_object = document.createElement("li");
  //     if(key == "image" || key == "logo") {
  //       var img_object = document.createElement("img");
  //       img_object.src = obj;
  //       div_object.append(img_object);
  //     }
  //     else {
  //       div_object.innerHTML = key + ": " + obj;
  //     }
  //     div_object.classList.add(key);
  //     main_content.append(div_object);
  // }

  li_website_info = document.createElement("li");
  li_website_info.classList.add("website-information");

  if(main_json['logo']) {
      li_website_info.classList.add("withlogo");
      var div_main_image = document.createElement("div");
      div_main_image.classList.add("main-logo");
      var ol_main_image = document.createElement("ol");
      var li_main_image = document.createElement("li");
      li_main_image.classList.add("logo");
      var img_main_image = document.createElement("img");
      img_main_image.src = main_json['logo'];
      li_main_image.append(img_main_image);
      ol_main_image.append(li_main_image);
      div_main_image.append(ol_main_image);
      li_website_info.append(div_main_image);
  }


  var div_main_info = document.createElement("div");
  div_main_info.classList.add("info");
  var ol_main_info = document.createElement("ol");
  var li1_main_info = document.createElement("li");

  if(main_json['publisher']) {
    li1_main_info.classList.add("publisher");
    li1_main_info.innerText = main_json['publisher'];
  }
  else {
    li1_main_info.classList.add("hostname");
    li1_main_info.innerText =  main_json['hostname'];
  }
  var li2_main_info = document.createElement("li");
  li2_main_info.classList.add("url");
  li2_main_info.innerText =  main_json['url'];

  ol_main_info.append(li1_main_info);
  ol_main_info.append(li2_main_info);
  div_main_info.append(ol_main_info);

  li_website_info.append(div_main_info);

  li_page_description = document.createElement("li");
  li_page_description.classList.add("page-description");
  div_main_description = document.createElement("div");
  div_main_description.classList.add("main-description");
  ol_main_description = document.createElement("ol");

  if(main_json['title']) {
    var title_main_description =  document.createElement("li");
    title_main_description.classList.add("title");
    title_main_description.innerHTML = main_json['title'];
    ol_main_description.append(title_main_description);
  }

  if(main_json['description']) {
    var description_main_description =  document.createElement("li");
    description_main_description.classList.add("description");
    description_main_description.innerHTML = main_json['description'];
    ol_main_description.append(description_main_description);
  }

  if(main_json['date']) {
    const date = new Date(main_json['date']);
    var date_main_description =  document.createElement("li");
    date_main_description.classList.add("date");
    date_main_description.innerHTML = date.toDateString();
    ol_main_description.append(date_main_description);
  }

  if(main_json['author']) {
    var author_main_description =  document.createElement("li");
    author_main_description.classList.add("author");
    author_main_description.innerHTML = main_json['author'];
    ol_main_description.append(author_main_description);
  }

  div_main_description.append(ol_main_description);
  li_page_description.append(div_main_description);

  main_content.append(li_website_info);
  main_content.append(li_page_description);

  if(main_json['image']) {
    var li_main_image =  document.createElement("li");
    li_main_image.classList.add("image");
    var img_main_image =  document.createElement("img");
    img_main_image.src = main_json['image'];
    li_main_image.append(img_main_image);
    main_content.append(li_main_image);
  }

  if(main_json['currency'] || main_json['asin']) {

    var li_main_product =  document.createElement("li");
    li_main_product.classList.add("product-information");

    var div_main_product =  document.createElement("div");
    div_main_product.classList.add("information");

    var ol_main_product =  document.createElement("ol");

    if(main_json['currency']) {
      var currency_main_product =  document.createElement("li");
      currency_main_product.classList.add("currency");
      currency_main_product.innerHTML = main_json['currency'];
    }

    if(main_json['asin']) {
      var asin_main_product =  document.createElement("li");
      asin_main_product.classList.add("asin");
      asin_main_product.innerHTML = main_json['asin'];
    }

    ol_main_product.append(currency_main_product);
    ol_main_product.append(asin_main_product);

    div_main_product.append(ol_main_product);
    li_main_product.append(div_main_product);

    main_content.append(li_main_product);

  }

  if(main_json['audio'] || main_json['video']) { 
    var li_main_media=  document.createElement("li");
    li_main_media.classList.add("main_video_audio");

    var ol_main_media =  document.createElement("ol");

    if(main_json['audio']) {
      var audio_main_media =  document.createElement("li");
      audio_main_media.classList.add("audio");
      var a_main_media =  document.createElement("a");
      a_main_media.href = main_json['audio'];
      a_main_media.innerText = "Audio";
      audio_main_media.append(a_main_media);
      ol_main_media.append(audio_main_media);
    }

    if(main_json['video']) {
      var video_main_media =  document.createElement("li");
      video_main_media.classList.add("video");
      var a_main_media =  document.createElement("a");
      a_main_media.href = main_json['video'];
      a_main_media.innerText = "Video";
      video_main_media.append(a_main_media);
      ol_main_media.append(video_main_media);
    }

    li_main_media.append(ol_main_media);
    main_content.append(li_main_media);

  }

});

function checkURL(url) {
  return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

socket.on('register', status => {
  var errors = [];
  register_error.innerHTML = "";
  if(status.status.email_exist) {
    errors.push("This email been already been taken");
  }
  if(!status.status.email_valid) {
    errors.push("Please enter a valid email address");
  }
  if(status.status.username_exist) {
    errors.push("This username been already been taken");
  }
  if(!status.status.username_valid) {
    errors.push("Your user must not contain spaces or special characters");
  }
  if(!status.status.password_match) {
    errors.push("Your password and confirmation password do not match");
  }
  if(status.status.weak_password) {
   errors.push("Your password must contain lowercase, uppercase, symbol and/or number");
  }
  if(status.status.username_empty || status.status.password_empty || status.status.confirm_password_empty || status.status.email_empty) {
    errors.push("Please fill in all required fields");
  }
  errors.forEach((item, i) => {
    var for_li = document.createElement('li');
    for_li.innerHTML = item;
    register_error.append(for_li);
  });

})

socket.on('login', status => {
  var errors = [];
  login_error.innerHTML = "";
  if(!status.status.username_exist || !status.status.password_match) {
    errors.push("Please enter valid credentials");
  }
  if(status.status.username_empty || status.status.password_empty) {
    errors.push("Please fill in all required fields");
  }
  errors.forEach((item, i) => {
    var for_li = document.createElement('li');
    for_li.innerHTML = item;
    login_error.append(for_li);
  });
})

socket.on('redirect', function(destination) {
    window.location.href = destination;
});

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function matchWords(subject, words) {
  var regexMetachars = /[(){[*+?.\\^$|]/g;

  for (var i = 0; i < words.length; i++) {
      words[i] = words[i].replace(regexMetachars, "\\$&");
  }

  var regex = new RegExp("\\b(?:" + words.join("|") + ")\\b", "gi");
  return subject.match(regex) || [];
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const removeEmptyOrNull = (obj) => {
  Object.keys(obj).forEach(k =>
    (obj[k] && typeof obj[k] === 'object') && removeEmptyOrNull(obj[k]) ||
    (!obj[k] && obj[k] !== undefined) && delete obj[k]
  );
  return obj;
};
