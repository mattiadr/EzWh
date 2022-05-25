const User = require('../components/User');
const UserService = require('../services/User_service');
const U_dao = require('../database/User_DAO');
const User_service = new UserService(U_dao);
const DatabaseConnection = require("../database/DatabaseConnection");

async function testUsers(expectedUsers) {
    test('get all Users', async () => {
        let res = await User_service.getUsers();
        expect(res).toEqual(expectedUsers);
    });
}

async function testSuppliers(expectedUsers) {
    test('get all Suppliers', async () => {
        let res = await User_service.getUsersByRole("supplier");
        expect(res).toEqual(expectedUsers);
    });
}

async function testUser(id, name, surname, email, passwordHash, passwordSalt, role) {
    test('get User', async () => {
        let res = await User_service.getUserByID(id);
        expect(res.id).toStrictEqual(id);
        expect(res.name).toStrictEqual(name);
        expect(res.surname).toStrictEqual(surname);
        expect(res.email).toStrictEqual(email);
        expect(res.passwordHash).toStrictEqual(passwordHash);
        expect(res.passwordSalt).toStrictEqual(passwordSalt);
        expect(res.role).toStrictEqual(role);
    });
}

// test case definition
describe('get Users', () => {
    beforeAll(async () => {
        await DatabaseConnection.createConnection();
        await DatabaseConnection.resetAllTables();
        await DatabaseConnection.createDefaultUsers();
    });

    beforeEach(async () => {
        await U_dao.deleteUserData(); 
        await U_dao.insertUser(new User.User(1,"John","Snow","john.snow@supplier.ezwh.com","supplier"));
        await U_dao.insertUser(new User.User(2,"Michael","Jordan","michael.jordan@supplier.ezwh.com","supplier"));
    });

    const Users = [new User.User(1,"John","Snow","john.snow@supplier.ezwh.com","supplier"),
    new User.User(2,"Michael","Jordan","michael.jordan@supplier.ezwh.com","supplier")];

    testUsers(Users);
    testUser(Users[0].id, Users[0].name, Users[0].surname, Users[0].email, Users[0].passwordHash, Users[0].passwordSalt, Users[0].role);
    testUser(Users[1].id, Users[1].name, Users[1].surname, Users[1].email, Users[1].passwordHash, Users[1].passwordSalt, Users[1].role);
    
});

describe('get Suppliers', () => {
    beforeAll(async () => {
        await DatabaseConnection.createConnection();
        await DatabaseConnection.resetAllTables();
        await DatabaseConnection.createDefaultUsers();
    });

    beforeEach(async () => {
        await U_dao.deleteUserData(); 
        await U_dao.insertUser(new User.User(1,"John","Snow","john.snow@supplier.ezwh.com","supplier"));
        await U_dao.insertUser(new User.User(2,"Michael","Jordan","michael.jordan@supplier.ezwh.com","supplier"));
    });

    const Users = [new User.User(1,"John","Snow","john.snow@supplier.ezwh.com","supplier"),
    new User.User(2,"Michael","Jordan","michael.jordan@supplier.ezwh.com","supplier")];

    testSuppliers(Users);
    testUser(Users[0].id, Users[0].name, Users[0].surname, Users[0].email, Users[0].passwordHash, Users[0].passwordSalt, Users[0].role);
    testUser(Users[1].id, Users[1].name, Users[1].surname, Users[1].email, Users[1].passwordHash, Users[1].passwordSalt, Users[1].role);
    
});

describe("set User", () => {
    beforeAll(async () => {
        await DatabaseConnection.createConnection();
        await DatabaseConnection.resetAllTables();
        await DatabaseConnection.createDefaultUsers();
    });

    beforeEach(async () => {
        await U_dao.deleteUserData(); 
        await U_dao.insertUser(new User.User(1,"John","Snow","john.snow@supplier.ezwh.com","supplier"));
        await U_dao.insertUser(new User.User(2,"Michael","Jordan","michael.jordan@supplier.ezwh.com","supplier"));
    });

    test('new User', async () => {
        const User1 = new User.User(1,"John","Snow","john.snow@supplier.ezwh.com","supplier");
        const User2 = new User.User(2,"Michael","Jordan","michael.jordan@supplier.ezwh.com","supplier");

        let res = await User_service.createUser(User1.name,User1.surname,User1.email,User1.passwordHash,User1.passwordSalt,User1.role);
        expect(res.status).toEqual(201);
        res = await User_service.getUserByID(User1.id);
        expect(res).toEqual(User1);

        res = await User_service.createUser(User2.name,User2.surname,User2.email,User2.passwordHash,User2.passwordSalt,User2.role);
        expect(res.status).toEqual(404);
        res = await User_service.getUserByID(User2.id);
        expect(res).toBeNull();
    });

    test('update User', async () => {
        const User1 = new User.User(1,"John","Snow","john.snow@supplier.ezwh.com","supplier");
        const User2 = new User.User(2,"Michael","Jordan","michael.jordan@supplier.ezwh.com","clerk");       
        const User3 = new User(3,"Seymour","Skinner","seymour.skinner@clerk.ezwh.com","clerk");
        
        let res = await User_service.updateUser(User1.name,User1.surname,User1.email,User1.passwordHash,User1.passwordSalt,User1.role);
        expect(res.status).toEqual(200);
        res = await User_service.getUserByID(User1.id);
        expect(res).toEqual(User1);

        res = await User_service.updateUser(User2.name,User2.surname,User2.email,User2.passwordHash,User2.passwordSalt,User2.role);
        expect(res.status).toEqual(404);
        expect(res.body).toEqual("User not found");
        res = await User_service.getUserByID(User2.id);
        expect(res).toEqual({});

        res = await User_service.updateUser(User3.name,User3.surname,User3.email,User3.passwordHash,User3.passwordSalt,User3.role);
        expect(res.status).toEqual(404);
        expect(res.body).toEqual("id not found");
        res = await User_service.getUserByID(User3.id);
        expect(res).toBeNull();
    });
});

describe("delete User", () => {
    beforeAll(async () => {
        await DatabaseConnection.createConnection();
        await DatabaseConnection.resetAllTables();
        await DatabaseConnection.createDefaultUsers();
    });
    beforeEach(async () => {
        await U_dao.deleteUserData();
        await U_dao.insertUser(new User.User(1,"John","Snow","john.snow@supplier.ezwh.com","supplier"));
    });
    test('delete User', async () => {
        const idPos = 1;
        let res = await User_service.deleteTestDescriptor(idPos);
        res = await User_service.getTestDescriptorByID(idPos);
        expect(res).toBeNull();

    });
});