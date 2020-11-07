const mysql = require('./connection');
const validator = require("email-validator");
const isValidUsername = require('is-valid-username');
const passwordStrength = require('check-password-strength')
const crypto = require('crypto');

login_check_list = {
  username_exist:false,
  username_empty:true,
  password_match:false,
  password_empty:true,
  login:false
};

exports.login = async function login(auth, status) {

  if(auth.password) {
    login_check_list.password_empty = false;
  }
  else {
    login_check_list.password_empty = true;
  }

  if(auth.username) {
    login_check_list.username_empty = false;
  }
  else {
    login_check_list.username_empty = true;
  }

  const sql = "SELECT * FROM `website`.`table` WHERE `table`.`username` = ?;";
  mysql.connection.query(sql, [auth.username], function(error, results) {
    if(error) {
      throw error;
    }
    else if(results.length == 1) {
      const hash_password = crypto.pbkdf2Sync(auth.password, results[0].salt, 1000, 64, `sha512`).toString('hex');
      login_check_list.username_exist = true;
      if (auth.username === results[0].username && results[0].password === hash_password){
        login_check_list.password_match = true;
        login_check_list.login = true;
      }
      else {
        login_check_list.password_match = false;
        login_check_list.login = false;
      }
    }
    else {
      login_check_list.username_exist = false;
      login_check_list.password_match = false;
      login_check_list.login = false;
    }
    status(login_check_list);
  });

}

registration_check_list = {
  email_exist:false,
  email_valid:false,
  email_empty:true,
  username_exist:false,
  username_valid:false,
  username_empty:true,
  password_match:false,
  password_empty:true,
  confirm_password_empty:true,
  weak_password:true,
  password_strength:0,
  register:false,
  create_account:false,
};

exports.register = function register(auth, status) {

  if(auth.password) {
    registration_check_list.password_empty = false;
    strength = passwordStrength(auth.password);
    registration_check_list.password_strength = strength.id;
    if(strength.id == 1 || strength.id == 2) {
      registration_check_list.weak_password = false;
    }
    else  {
      registration_check_list.weak_password = true;
    }
  }
  else {
    registration_check_list.password_strength = 0;
    registration_check_list.password_empty = true;
    registration_check_list.weak_password = false;
  }

  if(auth.confirm_password) {
    registration_check_list.confirm_password_empty = false;
  }
  else {
    registration_check_list.confirm_password_empty = true;
  }

  if(auth.password == auth.confirm_password) {
    registration_check_list.password_match = true;
  }
  else {
    registration_check_list.password_match = false;
  }

  if(validator.validate(auth.email)) {
    registration_check_list.email_valid = true;
  }
  else {
    registration_check_list.email_valid = false;
  }

  if(isValidUsername(auth.username)) {
    registration_check_list.username_valid = true;
  }
  else {
    registration_check_list.username_valid = false;
  }

  if(auth.email) {
    registration_check_list.email_empty = false;
  }
  else {
    registration_check_list.email_empty = true;
  }

  if(auth.username) {
    registration_check_list.username_empty = false;
  }
  else {
    registration_check_list.username_empty = true;
  }

  const sql_email = "SELECT * FROM `website`.`table` WHERE `table`.`email` = ?;";
  mysql.connection.query(sql_email, [auth.email], function(error, results) {
    if(error) {
      throw error;
    }
    else if(results.length == 1) {
      registration_check_list.email_exist = true;
    }
    else {
      registration_check_list.email_exist = false;
    }

    const sql_username = "SELECT * FROM `website`.`table` WHERE `table`.`username` = ?;";
    mysql.connection.query(sql_username, [auth.username], function(error, results) {
      if(error) {
        throw error;
      }
      else if(results.length == 1) {
        registration_check_list.username_exist = true;
      }
      else {
        registration_check_list.username_exist = false;
      }
      status(registration_check_list);
    });

  });
}

exports.create_account = function create_account(auth, status) {
  if(!status.email_empty && status.email_valid && !status.email_exist && !status.username_empty && status.username_valid
    && !status.username_exist && status.password_match && !status.password_empty && !status.confirm_password_empty
    && !status.weak_password) {
      registration_check_list.register = true;
      const salt = crypto.randomBytes(33).toString('hex');
      const hash_password = crypto.pbkdf2Sync(auth.password , salt, 1000, 64, `sha512`).toString('hex');
      const sql_user = "INSERT INTO `website`.`table` (`username`, `email`, `password`, `salt`) VALUES (?, ?, ?, ?)";
      mysql.connection.query(sql_user, [auth.username, auth.email, hash_password, salt], function (error, result) {
        if (error) {
          throw error;
        }
        else if(result.affectedRows == 1) {
          registration_check_list.create_account = true;
        }
        else {
          registration_check_list.create_account = false;
        }
        status(registration_check_list);
      });
  }
  else {
    registration_check_list.register = false;
    registration_check_list.create_account = false;
    status(registration_check_list);
  }
}

set_user_session_check_list = {
  user_session_set:false,
  user_session_id:"",
  user_id:""
};

exports.set_login_cookie = function set_login_cookie(auth, status, session_status) {
  if(status.login) {
    set_user_session_check_list.user_session_id = crypto.randomBytes(33).toString('hex');
    const sql_username = "SELECT * FROM `website`.`table` WHERE `table`.`username` = ?;";
    mysql.connection.query(sql_username, [auth.username], function(error, results) {
      if(error) {
        throw error;
      }
      else if(results.length == 1) {
        set_user_session_check_list.user_id = results[0].id;
        sql_session_update = "UPDATE `website`.`table` SET `session_id` = ? WHERE `id` = ?";
        mysql.connection.query(sql_session_update, [set_user_session_check_list.user_session_id, results[0].id], function(error, result) {
          if(error) {
            throw error;
          }
          else if(result.affectedRows == 1) {
            set_user_session_check_list.user_session_set = true;
          }
          else  {
            set_user_session_check_list.user_session_set = false;
          }
          session_status(set_user_session_check_list);
        });  
      }
    });
  }
}