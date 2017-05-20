const swal = window.swal;
const SimpleMDE = window.SimpleMDE;
const fetch = window.fetch;
const Request = window.Request;
const jQuery = window.jQuery;

(function ($) {
  $(function () {
    $(function () {
      var simplemde = new SimpleMDE({
        element: $('#editor-textarea')[0],
        spellChecker: false,
        forceSync: true,
        autosave: {
          enabled: true,
          uniqueId: 'MyUniqueID',
          delay: 1000
        }
      });

      function bindNoteClick () {
        $('.note-button').click(function (event) {
          var id = $(this).attr('data-id');
          var request = new Request('/notes/' + id, {
            method: 'GET',
            redirect: 'follow',
            cors: 'same-origin',
            credentials: 'include'
          });
          var textarea = $('#editor-textarea');
          if (textarea.attr('data-current')) {
            fetch('/notes/' + textarea.attr('data-current'), {
              method: 'put',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                note: textarea.attr('data-current'),
                content: simplemde.value()
              }),
              cors: 'same-origin',
              credentials: 'include'
            }).then('Saved').then(() => {
              fetch(request).then(response => response.json()).then(response => {
                simplemde.value(response.content);
                $('#editor-textarea').attr('data-current', response.id);
                $('#selected-note').removeAttr('id');
                $('div', this).attr('id', 'selected-note');
              }).catch(console.error);
            });
          } else {
            fetch(request).then(response => response.json()).then(response => {
              simplemde.value(response.content);
              $('#editor-textarea').attr('data-current', response.id);
              $('#selected-note').removeAttr('id');
              $('div', this).attr('id', 'selected-note');
            }).catch(console.error);
          }
        });
      }

      bindNoteClick();

      $('#add-note').click(function () {
        swal.setDefaults({
          input: 'text',
          confirmButtonText: 'Next &rarr;',
          showCancelButton: true,
          cancelButtonColor: '#ffa900',
          animation: false,
          progressSteps: ['1', '2']
        });

        var steps = [
          'Title?',
          'Description?'
        ];

        swal.queue(steps).then(function (result) {
          swal.resetDefaults();
          fetch('/notes', {
            method: 'post',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              title: result[0],
              description: result[1]
            }),
            cors: 'same-origin',
            credentials: 'include'
          }).then(response => response.json()).then((res) => {
            if (res.error) {
              swal(
                res.error.message,
                res.error.description,
                'error'
              );
            }
            fetch('/partials/sidebar', {
              method: 'get',
              cors: 'same-origin',
              credentials: 'include'
            }).then(response => response.text()).then(response => {
              $('#sidebar').html(response);
              bindNoteClick();
              simplemde.value('');
              $('#editor-textarea').attr('data-current', '');

              swal({
                title: 'Your note has been created!',
                type: 'success',
                timer: 2000,
                showConfirmButton: false,
                showCancelButton: false
              });
            });
          });
        }, function () {
          swal.resetDefaults();
        });
      });
      $('#delete-note').click(() => {
        var selected = $('#selected-note');
        if (!selected.parent().attr('data-id')) return;

        swal({
          title: `Are you sure you want to delete note: ${$('#selected-note h3').text()} ?`,
          text: 'You won\'t be able to revert this!',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#ffa900',
          confirmButtonText: 'Yes, delete it!'
        }).then(function () {
          fetch('/notes/' + selected.parent().attr('data-id'), {
            method: 'delete',
            cors: 'same-origin',
            credentials: 'include'
          }).then(() => {
            fetch('/partials/sidebar', {
              method: 'get',
              cors: 'same-origin',
              credentials: 'include'
            }).then(response => response.text()).then(response => {
              $('#sidebar').html(response);
              bindNoteClick();
              simplemde.value('');
              $('#editor-textarea').attr('data-current', '');

              swal({
                title: 'Deleted!',
                text: 'Your note has been deleted.',
                type: 'success'
              });
            });
          });
        });
      });
      $('#edit-note').click(() => {
        var selected = $('#selected-note');
        if (!selected.parent().attr('data-id')) return;
        swal({
          title: 'Edit note',
          html: `<input id="title" class="swal2-input" value="${$('#selected-note h3').text()}">` +
            `<input id="description" class="swal2-input" value="${$('#selected-note p').text()}">`,
          preConfirm: function () {
            return new Promise(function (resolve) {
              resolve([
                $('#title').val(),
                $('#description').val()
              ]);
            });
          },
          onOpen: function () {
            $('#title').focus();
          }
        }).then(function (result) {
          fetch('/notes/' + selected.parent().attr('data-id'), {
            method: 'post',
            cors: 'same-origin',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              title: result[0],
              description: result[1]
            })
          }).then(() => {
            fetch('/partials/sidebar', {
              method: 'get',
              cors: 'same-origin',
              credentials: 'include'
            }).then(response => response.text()).then(response => {
              $('#sidebar').html(response);
              bindNoteClick();

              swal({
                title: 'Updated!',
                text: 'Your note has been updated.',
                type: 'success'
              });
            }).catch(console.error);
          });
        }).catch(swal.noop);
      });
      $('#user-avatar').click(() => {
        fetch('/me', {
          method: 'get',
          credentials: 'include'
        }).then(response => response.json()).then(user => {
          swal({
            title: 'Profile',
            imageUrl: 'https://avatars.io/gravatar/' + user.email,
            imageWidth: 200,
            imageHeight: 200,
            html: `Username: ${user.username} <br> Email: ${user.email}`,
            showCloseButton: true,
            showCancelButton: true,
            cancelButtonText: 'Close'
          });
        });
      });
      $('#logout').click(() => { window.location.href = '/login'; });
      setInterval(() => {
        var textarea = $('#editor-textarea');
        if (!textarea.attr('data-current')) return;

        fetch('/notes/' + textarea.attr('data-current'), {
          method: 'put',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            note: textarea.attr('data-current'),
            content: simplemde.value()
          }),
          cors: 'same-origin',
          credentials: 'include'
        }).then('Saved');
      }, 10000);
    });
  });
})(jQuery); // end of jQuery name space
