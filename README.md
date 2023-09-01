# Election Portal
The Election Portal is a comprehensive web application designed for efficient team management and organized elections. The frontend is developed using EJS (Embedded JavaScript templates), CSS, and JavaScript, while the backend is powered by Node.js, Express.js, and MongoDB as the database.

## Features

### Team Management
- **Create Teams:** Users can create teams for election purposes.
- **Invite Users:** Team admins can invite users to join their teams.

### Poll Creation
- **Create Polls:** Admins can create polls with a variable number of text options.
- **Support for Media Options:** Polls support different types of options such as images, audio, and video.
- **Deadline for Polls:** Admins can set deadlines for automatically ending polls.

### Dashboard
- **Team Dashboard:** Each team has a dedicated dashboard displaying polls in chronological order.
- **Poll Results:** Results are displayed after the admin ends a poll.

### Notifications
- **Admin Notifications:** Admins receive notifications when someone submits a vote or joins their team using an invite.

### User Roles
- **Multiple Admins:** Ability to have multiple admins for a team.
- **User Roles:** Support for different user roles like teachers, class representatives (CR), students, etc.

### Additional Features
- **Visualization:** Plots and graphs are used to visualize the results of polls.

## Setup and Getting Started
1. Download or clone this repo to your local system.
2. For this repo, you have to create your own `config.env` file or rename the `config.example` file to `config.env`, which is provided as an example for the contents to be filled in .env file.
3. After this, open the terminal and run the following command to download all the dependencies.
```
npm install
```
4. After downloading all the dependencies, run the following command in the terminal.
```
npm run dev
```
5. Now, navigate to http://localhost:4000