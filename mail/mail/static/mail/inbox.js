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
  document.querySelector('#single-email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Send email
  document.querySelector('#compose-form').onsubmit = () => {
    send_email();
    return false;
  }
}

function send_email() {
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
  
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'none';

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

      // Create element
      const element = document.createElement('div');

      // If element is read, set additional class "read" that have gray color in .css
      if (email['read'] == true) {
        element.className = "card read";
      }
      else {
        element.className = "card";
      }

      // Set element's body to display email info and content
      element.innerHTML = `<div class="container card-body">` +
        `<div class="row"><div class="col-sm">${email.sender}</div>` +
        `<div class="col-sm">${email.subject}</div>` +
        `<div class="col-sm">${email.timestamp}</div>` +
        `</div></div>`;
      
      element.addEventListener('click', function() {
        console.log('This element has been clicked!');
        console.log(mailbox);
        single_email(email, mailbox);

      });

      // Append emails list with the new element
      document.querySelector('#emails-view').append(element);
    }

  });
}

function single_email(singleEmail, mailbox) {
  
  // Show single email and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'block';

  if (mailbox == 'archive') {
    document.getElementById('archive-button').style.visibility = 'visible';
    document.querySelector('#archive-button').innerHTML = 'Unarchive';
  }
  else if (mailbox == 'inbox') {
    document.getElementById('archive-button').style.visibility = 'visible';
    document.querySelector('#archive-button').innerHTML = 'Archive';
  }
  else if (mailbox == 'sent') {
    document.getElementById('archive-button').style.visibility = 'hidden';
  }

  fetch(`/emails/${singleEmail['id']}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);

    // ... do something else with email ...
    document.getElementById("email-from").innerHTML = email.sender;
    document.getElementById("email-to").innerHTML = email.recipients;
    document.getElementById("email-subject").innerHTML = email.subject;
    document.getElementById("email-timestamp").innerHTML = email.timestamp;
    document.getElementById("email-body").innerHTML = email.body;

    if (singleEmail['read'] == false) {
      read_email(singleEmail['id']);
    }

    var state = email['archived'];

    document.querySelector('#archive-button').addEventListener('click', () => {
      //archive(email['id'], mailbox);
      
      fetch(`/emails/${singleEmail['id']}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: !state
        })
      })
      .then(() => load_mailbox('inbox'));
      window.location.reload();
    });

    document.querySelector('#reply-button').addEventListener('click', () => {
      reply(email);
      
    });

  });
}

function read_email(id) {

    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    });
}

function reply(singleEmail){
  
  // compose_email();

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#single-email-view').style.display = 'none';

  // Set composition fields
  document.querySelector('#compose-recipients').value = singleEmail['sender'];

  if (singleEmail['subject'].startsWith('Re:')) {
    document.querySelector('#compose-subject').value = singleEmail['subject'];
  }
  else {
    document.querySelector('#compose-subject').value = `Re: ` + singleEmail['subject'];
  }

  var newBody = `\n On ${singleEmail['timestamp']} ${singleEmail['sender']} wrote:\n ${singleEmail['body']}`
  document.querySelector('#compose-body').value = newBody;

  // Send email
  document.querySelector('#compose-form').onsubmit = () => {
    send_email();
    return false;
  }
}

