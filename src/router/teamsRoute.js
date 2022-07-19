const express = require("express");
const router = new express.Router();

const mongoose = require('mongoose');
const DB = process.env.DATABASE
require('../db/mongoose');

const User = require("../models/userSchema");
const Team = require("../models/teamsSchema");
const Poll = require("../models/pollsSchema");

const { requiredAuth, checkUser } = require("../auth/authMiddleware.js")

// create teams page
router.get('/:uid/createteams', requiredAuth, checkUser, async (req, res) => {
    const usersData = await User.find({})
    res.render('createteams', { usersData, message: req.flash('message') })
})

// to create teams
router.post('/:uid/createteams', async (req, res) => {
    const user = await User.findById({ _id: req.params.uid })
    const { teamname, admin, createdon } = req.body;
    // console.log(teamname + " " + admin + " " + createdon)
    // console.log(user._id)

    if (!teamname || !admin || !createdon) {
        req.flash('message', 'Please fill all the fields')
        res.redirect('/'+user._id+'/createteams')
        // return res.status(422).json({ error: "Please fill all the fields" })
    }

    try {
        const teamExist = await Team.findOne({ teamname: teamname })

        if (teamExist) {
            req.flash('message', 'This team already exists. Please choose a different name!')
            res.redirect('/'+user._id+'/createteams')
            // return res.status(422).json({ error: "This team already exists. Please choose a different name!" })
        } else {
            
            // user creating the team is admin/owner of the team
            // const teamMembers = [user._id]
            const adminsList = [user.id]

            const team = new Team({ teamname, admin, adminsList, createdon })

            const teamRegistered = await team.save();

            if (teamRegistered) {
                // await User.findByIdAndUpdate({ _id: req.params.uid }, {$push: { teams: teamname }})
                await User.findByIdAndUpdate({ _id: req.params.uid }, {$push: { adminOfTeams: teamname }})
                
                req.flash('message', 'Team Created Successfully')
                res.redirect('/teams/details/'+team._id)
                // res.status(201).json({ message: "Team Created Successfully" });
            } else {
                req.flash('message', 'Failed to create this team')
                res.redirect('/'+user._id+'/createteams')
                // res.status(500).json({ error: "Failed to create this team" })
            }
        }
    } catch (err) {
        console.log(err)
    }
})

// your teams page
router.get('/:uid/teams', requiredAuth, checkUser, async (req, res) => {
    const user = await User.findById({ _id: req.params.uid })
    const teamsDataM = []
    const teamsDataA = []
    for (let i = 0; i < user.memberOfTeams.length; i++) {
        var team = await Team.findOne({ teamname: user.memberOfTeams[i] })
        teamsDataM.push(team)
    }
    for (let i = 0; i < user.adminOfTeams.length; i++) {
        var team = await Team.findOne({ teamname: user.adminOfTeams[i] })
        teamsDataA.push(team)
    }
    // const user = await User.find({ user.teams: req.params.id })
    res.render('yourteams', { user, teamsDataM, teamsDataA, message: req.flash('message') })
})

// team details
router.get('/teams/details/:tid', requiredAuth, checkUser, async (req, res) => {
    try {
        const team = await Team.findById({ _id: req.params.tid })
        const adminOfTeams = await User.find({ adminOfTeams: team.teamname })
        const memberOfTeams = await User.find({ memberOfTeams: team.teamname })
        const invitaitionRecieved = await User.find({ invitaitionRecieved: team._id })
        const usersData = await User.find({})

        const invitaitionRejected = usersData
        // console.log(adminOfTeams[0]._id)
        for (let i = 0; i < invitaitionRecieved.length; i++) {
            invitaitionRejected.forEach((ele, index) => {
                if (ele._id.toString() == invitaitionRecieved[i]._id.toString()) {
                    invitaitionRejected.splice(index, 1)
                }
            })
        }
        for (let i = 0; i < adminOfTeams.length; i++) {
            invitaitionRejected.forEach((ele, index) => {
                if (ele._id.toString() == adminOfTeams[i]._id.toString()) {
                    invitaitionRejected.splice(index, 1)
                }
            })
        }
        for (let i = 0; i < memberOfTeams.length; i++) {
            invitaitionRejected.forEach((ele, index) => {
                if (ele._id.toString() == memberOfTeams[i]._id.toString()) {
                    invitaitionRejected.splice(index, 1)
                }
            })
        }
        res.render('teamdetails', { team, adminOfTeams, memberOfTeams, invitaitionRecieved, usersData, invitaitionRejected, message: req.flash('message') })
    } catch (err) {
        console.log(err)
    }
})

// make memebers as admin
router.get('/teams/details/makeadmin/:tid/:uid', requiredAuth, checkUser, async (req, res) => {
    try{
        const team = await Team.findById({ _id: req.params.tid })
        const user = await User.findById({ _id: req.params.uid })

        await Team.findByIdAndUpdate({ _id: req.params.tid }, {$pull: { teamMembers: user._id }})
        await Team.findByIdAndUpdate({ _id: req.params.tid }, {$push: { adminsList: user._id }})
        await User.findByIdAndUpdate({ _id: req.params.uid }, {$pull: { memberOfTeams: team.teamname }})
        await User.findByIdAndUpdate({ _id: req.params.uid }, {$push: { adminOfTeams: team.teamname }})

        req.flash('message', user.name+' - is now an admin')
        res.redirect('/teams/details/'+team._id)
    } catch (err) {
        console.log(err)
    }
})

module.exports = router