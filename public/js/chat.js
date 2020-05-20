const socket = io();

//Elements
const $button = document.querySelector('#welcomeMessage');
const $input = document.querySelector('#texto');
const $sendLocation = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild;

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    //visible height
    const visibleHeight = $messages.offsetHeight;

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far have i scrolled?
    const scrollOffset = ($messages.scrollTop + visibleHeight) * 2;

    if (containerHeight - newMessageHeight < scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }

    console.log(newMessageMargin);
}

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:m a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('locationMessage', (message) => {
    console.log(message);
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        location: message.url,
        createdAt: moment(message.createdAt).format('h:m a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sideBarTemplate, {
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML = html;
});

$button.addEventListener('click', (e) => {
    e.preventDefault();

    $button.setAttribute('disabled', 'disabled');
    //disable
    const mensaje = document.getElementById('texto').value;

    socket.emit('sendMessage', mensaje, (error) => {
        $button.removeAttribute('disabled');
        $input.value = '';
        $input.focus();
        //enable
        if (error) {
            return console.log(error);
        }

        console.log('Message delivered');
    });

});

$sendLocation.addEventListener('click', (e) => {
    e.preventDefault();

    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser');
    }

    $sendLocation.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocation.removeAttribute('disabled');
            console.log('Location shared!');
        });
    });
});

socket.emit('join', {
    username,
    room
}, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});