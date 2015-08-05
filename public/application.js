$(document).ready(function() {
  var Communicator = function () {
    this.checkLogin();
  };

  Communicator.prototype.login = function(user) {
    var successFunction = function(response) {
      if (response.authorized) {
        $('input[name="username-login"]').val("");
        $('input[name="password-login"]').val("");
        this.checkLogin();   
      } else {
        $('.sidebar .alert-danger').text("User or Password is incorrect!");
        $('.sidebar .alert-danger').show();
      }
    }

    $.ajax({
      context: this,
      type:"POST",
      url:"/sessions",
      data: {
        user: user
      },
      datatype: 'json',
      success: successFunction,
      error: function(response) {
        console.log("error:" + response);
      }
    });
  }

  Communicator.prototype.createUser = function(user) {
    var successFunction = function(response) {
      console.log(response);
      if (response.exist) {
        $('.sidebar .alert-danger').text("User or Email already exist!");
        $('.sidebar .alert-danger').show();
      } else {
        //auto-log user in after account creation
        this.login(user);
      }
    }

    $.ajax({
      context: this,
      type:'POST',
      url: '/users',
      data: {
        user: user
      },
      datatype: 'json',
      success: successFunction,
      error: function(response) {
        console.log(response);
      }
    });
  }

  Communicator.prototype.logOut = function() {
    $.ajax({
      context: this,
      type:'DELETE',
      url: '/sessions',
      success: function(response) {
        this.checkLogin();
      },
      error: function(response) {
        console.log(response);
      }

    })
  }

  Communicator.prototype.checkLogin = function() {
    $.ajax({
      type:'GET',
      url: '/authenticated',
      success: function(response) {
        console.log(response);
        if (response.authenticated) {
          $('.navbar-right').append('<li><a id="log-out-link" href="#">Log Out</a></li>');
          $('#show-username').text(response.username);
          $('.login-bar').hide();
        } else {
          $('.login-bar').show();
          $('#show-username').text("Guest");
          $('#log-out-link').remove();
        }
      },
      error: function(response) {
        console.log(response);
      }
    });
  }

  var newCommunicator = new Communicator();

  $('#login').submit(function() {
    $('.alert').hide();
    //Build user
    var user = {
      username: $('input[name="username-login"]').val(),
      password: $('input[name="password-login"]').val()
    };
    newCommunicator.login(user);
    return false;
  });

  $('#sign-up').submit(function() {
    $('.alert').hide();
    //build user
    var user = {
      username: $('input[name="username-sign-up"]').val(),
      password: $('input[name="password-sign-up"]').val(),
      email:    $('input[name="email-sign-up"]').val(),
      name:     $('input[name="name-sign-up"]').val()
    }

    newCommunicator.createUser(user);
    return false;
  });

  $(document).on('click', '#log-out-link', function() {
    newCommunicator.logOut();
    return false;
  });
});
