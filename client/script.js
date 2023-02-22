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



function chatStripe(isAi, value, uniqueId) {
    const profileImgSrc = isAi ? bot : user;
    const profileImgAlt = isAi ? 'bot' : 'user';
    const messageText = isAi ? '' : value;
    const messageElem = isAi ? `<div class="message" id=${uniqueId}></div>` : `<div class="message" id=${uniqueId}>${value}</div>`;
    const editButton = isAi ? '' : `<button class="edit-btn" onclick="editMessage('${uniqueId}')">Edit</button>`;
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
                ${messageElem}
                ${editButton}
            </div>
        </div>
    `
    )
}


const handleSubmit = async (e) => {
    e.preventDefault()

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

function editMessage(uniqueId) {
    const messageDiv = document.getElementById(uniqueId);
    const messageText = messageDiv.textContent;

    // Create a text area element
    const textarea = document.createElement('textarea');
    textarea.value = messageText;

    // Replace the message element with the text area
    messageDiv.parentNode.replaceChild(textarea, messageDiv);

    // Add event listeners to handle editing the message
    textarea.addEventListener('keydown', function(e) {
        // Disable editing when the Enter key is pressed
        if (e.keyCode === 13) {
            e.preventDefault();
            this.disabled = true;
            this.style.color = '#000';
            this.style.backgroundColor = '#f4f4f4';
        }
    });

    textarea.addEventListener('blur', function() {
        // Revert the message back to a div element when the text area loses focus
        const newMessageDiv = document.createElement('div');
        newMessageDiv.textContent = this.value;
        newMessageDiv.id = uniqueId;
        this.parentNode.replaceChild(newMessageDiv, this);
    });
}





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