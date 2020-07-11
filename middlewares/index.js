const requireLogin = require('./requireLogin');
const requireUser = require('./requireUser');
const requireAdmin = require('./requireAdmin')
const requireLawyer = require('./requireLawyer');


module.exports = {
    requireLogin, requireUser, requireAdmin, requireLawyer
}