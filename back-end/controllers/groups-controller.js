const { groupModel } = require('../models/groups-model');
const { userModel } = require('../models/users-model');
const { groupInviteModel } = require('../models/group-invites-model');
const {
    createElement,
    getAllElements,
    getElementById,
    updateElement,
    deleteElement,
} = require('../db/db-utils');

// Converteste id-ul la numar si valideaza formatul
function parseId(value) {
    const id = Number.parseInt(value, 10);
    return Number.isNaN(id) ? null : id;
}

// Creeaza un grup nou
async function createGroup(req, res) {
    try {
        const { name } = req.body || {};
        if (!name) {
            return res.status(400).json({ message: 'name este obligatoriu.' });
        }

        const ownerId = req.user?.userId;
        if (!ownerId) {
            return res.status(401).json({ message: 'Utilizator neautentificat.' });
        }

        const group = await createElement(groupModel, { name, ownerId });
        return res.status(201).json(group);
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut crea grupul.', error: error.message });
    }
}

// Returneaza toate grupurile
async function getGroups(req, res) {
    try {
        const groups = await getAllElements(groupModel);
        return res.status(200).json(groups);
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-au putut obtine grupurile.', error: error.message });
    }
}

// Returneaza un grup dupa id
async function getGroupById(req, res) {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'ID-ul grupului este invalid.' });
        }

        const group = await getElementById(groupModel, id);
        if (!group) {
            return res.status(404).json({ message: 'Grupul nu a fost gasit.' });
        }

        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Utilizator neautentificat.' });
        }

        if (group.ownerId !== userId) {
            return res.status(403).json({ message: 'Nu aveti acces la acest grup.' });
        }

        return res.status(200).json(group);
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut obtine grupul.', error: error.message });
    }
}

// Actualizeaza datele unui grup
async function updateGroup(req, res) {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'ID-ul grupului este invalid.' });
        }

        const group = await getElementById(groupModel, id);
        if (!group) {
            return res.status(404).json({ message: 'Grupul nu a fost gasit.' });
        }

        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Utilizator neautentificat.' });
        }

        if (group.ownerId !== userId) {
            return res.status(403).json({ message: 'Nu aveti dreptul sa modificati acest grup.' });
        }

        const { name } = req.body || {};
        const updatedGroup = await updateElement(groupModel, id, { name });

        if (!updatedGroup) {
            return res.status(404).json({ message: 'Grupul nu a fost gasit.' });
        }

        return res.status(200).json(updatedGroup);
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut actualiza grupul.', error: error.message });
    }
}

// Sterge un grup
async function deleteGroup(req, res) {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'ID-ul grupului este invalid.' });
        }

        const group = await getElementById(groupModel, id);
        if (!group) {
            return res.status(404).json({ message: 'Grupul nu a fost gasit.' });
        }

        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Utilizator neautentificat.' });
        }

        if (group.ownerId !== userId) {
            return res.status(403).json({ message: 'Nu aveti dreptul sa stergeti acest grup.' });
        }

        const deleted = await deleteElement(groupModel, id);
        if (!deleted) {
            return res.status(404).json({ message: 'Grupul nu a fost gasit.' });
        }

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut sterge grupul.', error: error.message });
    }
}

// Returneaza membrii unui grup
async function getGroupMembers(req, res) {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'ID-ul grupului este invalid.' });
        }

        const group = await getElementById(groupModel, id);
        if (!group) {
            return res.status(404).json({ message: 'Grupul nu a fost gasit.' });
        }

        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Utilizator neautentificat.' });
        }

        if (group.ownerId !== userId) {
            return res.status(403).json({ message: 'Nu aveti acces la membrii acestui grup.' });
        }

        const members = await group.getMembers();
        return res.status(200).json(members);
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-au putut obtine membrii grupului.', error: error.message });
    }
}

// Adauga un membru intr-un grup
async function addGroupMember(req, res) {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'ID-ul grupului este invalid.' });
        }

        const { userId: memberUserId, email } = req.body || {};
        if (!memberUserId && !email) {
            return res.status(400).json({ message: 'userId sau email este obligatoriu.' });
        }

        const group = await getElementById(groupModel, id);
        if (!group) {
            return res.status(404).json({ message: 'Grupul nu a fost gasit.' });
        }

        const ownerId = req.user?.userId;
        if (!ownerId) {
            return res.status(401).json({ message: 'Utilizator neautentificat.' });
        }

        if (group.ownerId !== ownerId) {
            return res.status(403).json({ message: 'Nu aveti dreptul sa adaugati membri in acest grup.' });
        }

        if (Number(memberUserId) === Number(ownerId)) {
            return res.status(400).json({ message: 'Proprietarul este deja membru implicit.' });
        }

        let member = null;
        if (memberUserId) {
            member = await getElementById(userModel, memberUserId);
        } else {
            member = await userModel.findOne({ where: { email } });
        }
        if (!member) {
            return res.status(404).json({ message: 'Utilizatorul nu a fost gasit.' });
        }

        const alreadyMember = await group.hasMember(member);
        if (alreadyMember) {
            return res.status(409).json({ message: 'Utilizatorul este deja membru in grup.' });
        }

        const existingInvite = await groupInviteModel.findOne({
            where: {
                groupId: group.groupId,
                invitedUserId: member.userId,
                status: 'pending',
            },
        });
        if (existingInvite) {
            return res.status(409).json({ message: 'Exista deja o invitatie activa.' });
        }

        await groupInviteModel.create({
            groupId: group.groupId,
            invitedUserId: member.userId,
            invitedByUserId: ownerId,
            status: 'pending',
        });

        return res.status(201).json({ message: 'Invitatia a fost trimisa.' });
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut trimite invitatia.', error: error.message });
    }
}

// Sterge un membru dintr-un grup
async function removeGroupMember(req, res) {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'ID-ul grupului este invalid.' });
        }

        const memberId = parseId(req.params.userId);
        if (!memberId) {
            return res.status(400).json({ message: 'ID-ul utilizatorului este invalid.' });
        }

        const group = await getElementById(groupModel, id);
        if (!group) {
            return res.status(404).json({ message: 'Grupul nu a fost gasit.' });
        }

        const ownerId = req.user?.userId;
        if (!ownerId) {
            return res.status(401).json({ message: 'Utilizator neautentificat.' });
        }

        if (group.ownerId !== ownerId) {
            return res.status(403).json({ message: 'Nu aveti dreptul sa stergeti membri din acest grup.' });
        }

        if (Number(memberId) === Number(ownerId)) {
            return res.status(400).json({ message: 'Proprietarul nu poate fi eliminat din grup.' });
        }

        const member = await getElementById(userModel, memberId);
        if (!member) {
            return res.status(404).json({ message: 'Utilizatorul nu a fost gasit.' });
        }

        await group.removeMember(member);
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut sterge membrul.', error: error.message });
    }
}

// Returneaza invitatiile primite de utilizator
async function getGroupInvites(req, res) {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Utilizator neautentificat.' });
        }

        const invites = await groupInviteModel.findAll({
            where: { invitedUserId: userId, status: 'pending' },
            include: [
                { model: groupModel, as: 'group' },
                { model: userModel, as: 'invitedBy' },
            ],
        });

        return res.status(200).json(invites);
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-au putut obtine invitatiile.', error: error.message });
    }
}

// Accepta o invitatie
async function acceptGroupInvite(req, res) {
    try {
        const inviteId = parseId(req.params.inviteId);
        if (!inviteId) {
            return res.status(400).json({ message: 'ID-ul invitatiei este invalid.' });
        }

        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Utilizator neautentificat.' });
        }

        const invite = await groupInviteModel.findByPk(inviteId);
        if (!invite) {
            return res.status(404).json({ message: 'Invitatia nu a fost gasita.' });
        }

        if (invite.invitedUserId !== userId) {
            return res.status(403).json({ message: 'Nu aveti dreptul sa acceptati aceasta invitatie.' });
        }

        if (invite.status !== 'pending') {
            return res.status(409).json({ message: 'Invitatia nu mai este activa.' });
        }

        const group = await getElementById(groupModel, invite.groupId);
        if (!group) {
            return res.status(404).json({ message: 'Grupul nu a fost gasit.' });
        }

        const user = await getElementById(userModel, userId);
        await group.addMember(user);
        await invite.update({ status: 'accepted' });

        return res.status(200).json({ message: 'Invitatia a fost acceptata.' });
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut accepta invitatia.', error: error.message });
    }
}

// Respinge o invitatie
async function declineGroupInvite(req, res) {
    try {
        const inviteId = parseId(req.params.inviteId);
        if (!inviteId) {
            return res.status(400).json({ message: 'ID-ul invitatiei este invalid.' });
        }

        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Utilizator neautentificat.' });
        }

        const invite = await groupInviteModel.findByPk(inviteId);
        if (!invite) {
            return res.status(404).json({ message: 'Invitatia nu a fost gasita.' });
        }

        if (invite.invitedUserId !== userId) {
            return res.status(403).json({ message: 'Nu aveti dreptul sa respingeti aceasta invitatie.' });
        }

        if (invite.status !== 'pending') {
            return res.status(409).json({ message: 'Invitatia nu mai este activa.' });
        }

        await invite.update({ status: 'declined' });
        return res.status(200).json({ message: 'Invitatia a fost respinsa.' });
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut respinge invitatia.', error: error.message });
    }
}

module.exports = {
    createGroup,
    getGroups,
    getGroupById,
    updateGroup,
    deleteGroup,
    getGroupMembers,
    addGroupMember,
    removeGroupMember,
    getGroupInvites,
    acceptGroupInvite,
    declineGroupInvite,
};
