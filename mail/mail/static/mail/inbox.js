document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Send email
  document.querySelector('#compose-form').onsubmit = () => {
    fetch("/emails", {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    // .then(response => response.text())
    // .then(text => console.log(text))
    .then(result => {
        // Print result
        console.log("Sending email");
        console.log(result);
        load_mailbox('sent');
    });
    return false;
  }
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);

    // ... do something else with emails ...
    for (const email of emails) {
      console.log(email);

      const element = document.createElement('div');
      element.className = "card";
      element.innerHTML = `<div class="container card-body">` +
        `<div class="row"><div class="col-sm">${email.sender}</div>` +
        `<div class="col-sm">${email.subject}</div>` +
        `<div class="col-sm">${email.timestamp}</div></div></div>`
      
      element.addEventListener('click', function() {
        console.log('This element has been clicked!')
      });
      document.querySelector('#emails-view').append(element);
    }
  });

  // function add_email(subject) {
  //   const element = document.createElement('div');
  //   element.innerHTML = subject;
  //   // element.addEventListener('click', function() {
  //   //   console.log('This element has been clicked!')
  //   // });
  //   document.querySelector('#emails-list').append(element);
  // }
}
