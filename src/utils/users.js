const users = [];

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    // Check for existing user
    const existingUser = users.find(x => x.room === room && x.username === username);

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use'
        }
    }

    //Store user
    const user = { id, username, room }
    users.push(user);
    return {
        user
    }
}

const removeUser = (id) => {
    const index = users.findIndex(x => x.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => {
    return users.find(x => x.id === id);
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter(x => x.room === room);
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}