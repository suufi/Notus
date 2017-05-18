const jQuery = window.jQuery;
const fetch = window.fetch;
const Request = window.Request;

(function ($) {
  $(function () {
    $(function () {
      $('#login-form').submit(function (e) {
        var request = new Request('/login', {
          method: 'POST',
          redirect: 'follow',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: $('#login-form').serialize(),
          cors: 'same-origin',
          credentials: 'include'
        });

        fetch(request).then(response => response.json()).then(response => {
          if (response.error) {
            $('#error-container span').text(response.message);
            $('#error-container').removeClass('hidden');
          } else {
            window.location.href = '/notes';
          }
        }).catch(console.error);

        e.preventDefault(); // avoid to execute the actual submit of the form.
      });

      $('#register-form').submit(function (e) {
        var request = new Request('/register', {
          method: 'POST',
          redirect: 'follow',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: $('#register-form').serialize(),
          cors: 'same-origin',
          credentials: 'include'
        });

        fetch(request).then(response => response.json()).then(response => {
          if (response.error) {
            $('#error-container span').text(response.message);
            $('#error-container').removeClass('hidden');
          } else {
            window.location.href = '/login';
          }
        }).catch(console.error);

        e.preventDefault(); // avoid to execute the actual submit of the form.
      });
    });
  }); // end of document ready
})(jQuery); // end of jQuery name space
