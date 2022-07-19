const express = require("express");
const router = new express.Router();

const mongoose = require('mongoose');
const DB = process.env.DATABASE
require('../db/mongoose');

const User = require("../models/userSchema");
const Team = require("../models/teamsSchema");
const Poll = require("../models/pollsSchema");

const { requiredAuth, checkUser } = require("../auth/authMiddleware.js")

// create polls page
router.get('/teams/polls/create/:tid/:uid', requiredAuth, checkUser, async (req, res) => {
    const team = await Team.findById({ _id: req.params.tid })
    const user = await Team.findById({ _id: req.params.uid })
    res.render('createpolls', { team, user, message: req.flash('message') })
})

// to create polls
router.post('/teams/polls/create/:tid/:uid', async (req, res) => {
    const team = await Team.findById({ _id: req.params.tid })
    const user = await User.findById({ _id: req.params.uid })
    const { title, description, teamname, createdby, createdon, deadline, optionTitle, optionImg } = req.body;

    if (!title || !description || !teamname || !createdby || !createdon || !deadline) {
        req.flash('message', 'Please fill all the fields.')
        res.redirect('/teams/polls/create/'+team._id+'/'+user._id)
        // return res.status(422).json({ error: "Please fill all the fields." })
    }

    try {
        const pollExist = await Poll.findOne({ title: title })

        if (pollExist) {
            req.flash('message', 'This Poll already exists. Please choose a different name!')
            res.redirect('/teams/polls/create/'+team._id+'/'+user._id)
            // return res.status(422).json({ error: "This Poll already exists. Please change the name!" })
        } else {
            // console.log(optionTitle)
            var optionVoted = []
            for (let i=0; i < optionTitle.length; i++) {
                optionVoted.push({
                    title: optionTitle[i],
                    img: optionImg[i],
                    votes: 0
                })
            }
            var pollActive = true;
            const poll = new Poll({ title, description, teamname, createdby, createdon, deadline, pollActive, optionTitle, optionImg, optionVoted })

            const pollRegistered = await poll.save();

            if (pollRegistered) {
                await Team.findOneAndUpdate({ _id: req.params.tid }, { $push: { polls: poll._id } })

                // notifications
                const teamAdmins = team.adminsList
                for (let i = 0; i < teamAdmins.length; i++) {
                    await User.findByIdAndUpdate({ _id: teamAdmins[i] }, { $push: { notifications: `${user.name} has created a poll ${poll.title} in the team ${team.teamname}` }})
                }
            
                // deleting the notification which was send to the user itself who created the poll
                await User.findByIdAndUpdate({ _id: req.params.uid }, { $pull: { notifications: `${user.name} has created a poll ${poll.title} in the team ${team.teamname}` }})
            
                const teamMembers = team.teamMembers
                for (let i = 0; i < teamMembers.length; i++) {
                    await User.findByIdAndUpdate({ _id: teamMembers[i] }, { $push: { notifications: `${user.name} has created a poll ${poll.title} in the team ${team.teamname}` }})
                }

                req.flash('message', 'Poll Created Successfully')
                res.redirect('/teams/polls/vote/'+poll._id+'/'+user._id)               
                // res.status(201).json({ message: "Poll Created Successfully" });
            } else {
                req.flash('message', 'Failed to create this poll')
                res.redirect('/teams/polls/create/'+team._id+'/'+user._id)   
                // res.status(500).json({ error: "Failed to create this poll" })
            }
        }
    } catch (err) {
        console.log(err)
    }
})

// view team polls page
router.get('/teams/polls/view/:tid', requiredAuth, checkUser, async (req, res) => {
    const team = await Team.findById({ _id: req.params.tid })
    
    var teamPolls = []
    // console.log(team.polls)
    for (let i = 0; i < team.polls.length; i++) {
        const poll = await Poll.findOne({ _id: team.polls[i] })
        teamPolls.push(poll)
    }
    // console.log(teamPolls)
    // res.send(teamPolls)
    res.render('viewpolls', { teamPolls, team, message: req.flash('message') })
})

// caste vote page 
router.get('/teams/polls/vote/:pid/:uid', requiredAuth, checkUser, async (req, res) => {
    const poll = await Poll.findById({ _id: req.params.pid })
    const user = await User.findById({ _id: req.params.uid })
    const team = await Team.findOne({ teamname: poll.teamname})
    // console.log(team)
    var userVoted = false;
    // console.log(user._id)
    // console.log(poll.usersVoted)
    
    // check if user has already voted
    for (let k=0; k < poll.usersVoted.length; k++) {
        var userVoteExist = await User.findById({ _id: poll.usersVoted[k] })
        // console.log(userVoteExist._id, "voters")
        // console.log(user._id, "user")
        if (userVoteExist._id.toString() === user._id.toString()) {
            userVoted = true;
            break;
        } else {
            userVoted = false;
        }
    }
    // console.log(userVoted)

    // check if deadlline is over
    var today = new Date()
    var deadline = poll.deadline

    if (poll.pollActive == true) {
        if (deadline > today) {
            poll.pollActive = true
        } else {
            poll.pollActive = false
        }
    }
    res.render('votepoll', { poll, team, userVoted, message: req.flash('message') })
})

// ending a poll
router.get('/teams/polls/vote/end/:pid/:uid', requiredAuth, checkUser, async (req, res) => {
    const poll = await Poll.findById({ _id: req.params.pid })
    const user = await User.findById({ _id: req.params.uid })
    await Poll.findByIdAndUpdate({ _id: req.params.pid }, {$set: { pollActive: false }})

    // notifications
    const team = await Team.findOne({ teamname: poll.teamname })
    const teamAdmins = team.adminsList
    for (let i = 0; i < teamAdmins.length; i++) {
        await User.findByIdAndUpdate({ _id: teamAdmins[i] }, { $push: { notifications: `${user.name} has ended the poll ${poll.title} in the team ${team.teamname}` }})
    }

    // deleting the notification which was send to the user itself who ended the poll
    await User.findByIdAndUpdate({ _id: req.params.uid }, { $pull: { notifications: `${user.name} has ended the poll ${poll.title} in the team ${team.teamname}` }})

    const teamMembers = team.teamMembers
    for (let i = 0; i < teamMembers.length; i++) {
        await User.findByIdAndUpdate({ _id: teamMembers[i] }, { $push: { notifications: `${user.name} has ended the poll ${poll.title} in the team ${team.teamname}` }})
    }

    req.flash('message', 'Poll has ended')
    res.redirect('/teams/polls/vote/'+poll._id+'/'+user._id)
})

// user casting vote
router.get('/teams/polls/vote/done/:pid/:uid/:oid', requiredAuth, checkUser, async (req, res) => {
    const poll = await Poll.findById({ _id: req.params.pid })
    const user = await User.findById({ _id: req.params.uid })

    // users voted list updated
    await Poll.findByIdAndUpdate({ _id: req.params.pid }, {$push: { usersVoted: user._id }})

    // increases the vote count
    await Poll.findOneAndUpdate({ _id: req.params.pid, 'optionVoted._id': req.params.oid }, { $inc: {'optionVoted.$.votes': 1 }})

    // notifications
    const team = await Team.findOne({ teamname: poll.teamname })
    const teamAdmins = team.adminsList
    for (let i = 0; i < teamAdmins.length; i++) {
        await User.findByIdAndUpdate({ _id: teamAdmins[i] }, { $push: { notifications: `${user.name} has voted for the poll ${poll.title} in the team ${team.teamname}` }})
    }

    // deleting the notification which was send to the user itself who caste the vote
    await User.findByIdAndUpdate({ _id: req.params.uid }, { $pull: { notifications: `${user.name} has voted for the poll ${poll.title} in the team ${team.teamname}` }})

    req.flash('message', 'Congrats! You have successfully voted')
    res.redirect('/teams/polls/vote/'+poll._id+'/'+user._id)
})

module.exports = router