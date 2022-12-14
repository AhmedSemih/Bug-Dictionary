const sequelize=require('../utils/database');
const Topic = require('../models/Topic');
const Entry = require('../models/Entry');

exports.getTopicById = (req, res) => {
    if (req.params.id !== 'favicon.ico' && req.query.page !== 'favicon.ico') {
        const page = req.query.page - 1 || 0;
        Topic.findByPk(req.params.id)
            .then((topic) => {
                Entry.findAndCountAll({ 
                    offset: 10 * page, 
                    limit: 10, 
                    where: { TopicId: req.params.id },
                    order: [[sequelize.literal(`(SELECT COUNT("like") FROM "Entries" WHERE "TopicId"=${req.params.id})`), 'DESC']] })
                    .then((result) => {
                        return res.render('topic', { topic, entries: result.rows, currentPage: page + 1, totalCount: result.count });
                    }).catch(error => console.log(error));
            }).catch((error) => console.log(error));
    }
};

exports.addTopic = (req, res) => {
    Topic.create({
        name:req.body.name,
        status:req.body.status,
        CategoryId:req.body.CategoryId,
        createdAt:Date.now()
    }).then((topic)=>{
        Entry.create({
            text:req.body.entry,
            TopicId:topic.dataValues.id,
            UserUsername:res.locals.currentUser.username
        }).then(()=>{
            res.redirect('back');
        }).catch((error)=>console.log(error));
    }).catch((error)=>console.log(error));
};

exports.updateTopic = (req, res) => {
    if (req.params.id !== 'favicon.ico') {
        Topic.update(req.body, { where: { id: req.params.id } })
            .then(() => {
                res.redirect('back');
            }).catch((error) => console.log(error));
    }
};
