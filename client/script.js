import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval

function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element, text) {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}


// new line 23feb

 // end new line

//function chatStripe(isAi, value, uniqueId) {
    // new added
    /*const profileImgSrc = isAi ? bot : user;
    const profileImgAlt = isAi ? 'bot' : 'user';
    const messageText = isAi ? '' : value;*/ // only show message text for user stripe
// end added
function chatStripe(isAi, value, uniqueId) {
    // new added
    const profileImgSrc = isAi ? bot : user;
    const profileImgAlt = isAi ? 'bot' : 'user';
    const messageText = isAi ? '' : value; // only show message text for user stripe
// end added
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                    src=${profileImgSrc} 
                    alt="${profileImgAlt}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
                ${isAi ? '<button class="copy-btn">Copy</button>' : ''}
            </div>
            ${isAi ? '<button class="copy-btn">Copy</button>' : ''}
        </div>
    `
    )
}

//start new lines
// Get the user's message count from the cookie
const messageCount = parseInt(getCookie('messageCount') || 0)

// Disable input and submit button if message limit has been reached
if (messageCount >= 5) {
  form.prompt.disabled = true
  form.submitBtn.disabled = true
}// new line

const handleSubmit = async (e) => {
    e.preventDefault()


    //new lines ///////////////
  
    / Check if message limit has been reached
    if (messageCount >= 5) {
      alert('You have reached the message limit for today. Please try again tomorrow.')
      return
    }
  
    // Increment the message count and store it in a cookie
    const newMessageCount = messageCount + 1
    setCookie('messageCount', newMessageCount, 1) // expires in 24 hours
  
    // Rest of the submit handler code...
  }
  
  function getCookie(name) {
    const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')
    return cookieValue ? cookieValue.pop() : ''
  }
  
  function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString()
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires
  }
    //end lines////////////

    const data = new FormData(form)

    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'))


    // to clear the textarea input 
    form.reset()

    // bot's chatstripe
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

    // to focus scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div 
    const messageDiv = document.getElementById(uniqueId)

    // messageDiv.innerHTML = "..."
    loader(messageDiv)



    //const response = await fetch('http://localhost:5000/', {
    const response = await fetch('https://metaaffinityaichat.onrender.com', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = " "

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim() // trims any trailing spaces/'\n' 

        typeText(messageDiv, parsedData)


        // create copy button after typing text effect is finished
       /*
        setTimeout(() => {
        messageDiv.innerHTML += '<button class="copy-button">Copy</button>'
        const copyButton = messageDiv.querySelector('.copy-button')
        copyButton.addEventListener('click', () => {
            const textToCopy = messageDiv.textContent
            navigator.clipboard.writeText(textToCopy)
            copyButton.textContent = 'Copied'
            setTimeout(() => {
                copyButton.textContent = 'Copy'
            }, 2000)
        })
        }, 500 + (20 * parsedData.length))
        */



    } else {
        const err = await response.text()

        messageDiv.innerHTML = "Something went wrong"
        alert(err)
    }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})

////////////////////////////////////////////
/*
function setCookie(name, value, expirationHours) {
    const date = new Date();
    date.setTime(date.getTime() + (expirationHours * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
  }
  
  function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + "=")) {
        return cookie.substring(name.length + 1);
      }
    }
    return null;
  }
  
*/
///////////////////////////////////////////
/* COpy response text with buttons*/
const copyTextToClipboard = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
};

chatContainer.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('.copy-btn');
    if (copyBtn) {
        const message = copyBtn.previousElementSibling.innerText;
        copyTextToClipboard(message);
        copyBtn.innerText = 'Copied';
        copyBtn.disabled = true;

        setTimeout(() => {
            copyBtn.innerText = "Copy";
            copyBtn.disabled = false;
        }, 4000);

        
    }
});


// copy the response message..
/*
function copyToClipboard(text) {
    const input = document.createElement('textarea');
    input.style.position = 'fixed';
    input.style.opacity = 0;
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('Copy');
    document.body.removeChild(input);
  }
  
  function copyResponseText(element) {
    const responseText = element.innerText.trim();
    copyToClipboard(responseText);
    alert(`"${responseText}" has been copied to your clipboard.`);
  }
  
  chatContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('message') && !e.target.classList.contains('loader')) {
      copyResponseText(e.target);
    }
  });
  */