# Integration and API Test Report

Date:

Version:

# Contents

- [Dependency graph](#dependency-graph)
- [Integration approach](#integration)
- [Tests](#tests)
- [Coverage of scenarios and FR](#coverage-of-scenarios-and-fr)
- [Coverage of non-functional requirements](#coverage-of-non-functional-requirements)


# Dependency graph 

```plantuml
class server

package routers {
    class SKU_router
    class SKUItem_router
    class Position_router
    class TestDescriptor_router
    class TestResult_router
    class User_router
    class RestockOrder_router
    class ReturnOrder_router
    class InternalOrder_router
    class Item_router
}

package services {
    class SKU_service
    class SKUItem_service
    class Position_service
    class TestDescriptor_service
    class TestResult_service
    class User_service
    class RestockOrder_service
    class ReturnOrder_service
    class InternalOrder_service
    class Item_service
}

package DAO {
    class SKU_DAO
    class SKUItem_DAO
    class Position_DAO
    class TestDescriptor_DAO
    class TestResult_DAO
    class User_DAO
    class RestockOrder_DAO
    class ReturnOrder_DAO
    class InternalOrder_DAO
    class Item_DAO
}

class DatabaseConnection

server <-- SKU_router
server <-- SKUItem_router
server <-- Position_router
server <-- TestDescriptor_router
server <-- TestResult_router
server <-- User_router
server <-- RestockOrder_router
server <-- ReturnOrder_router
server <-- InternalOrder_router
server <-- Item_router

SKU_router <-- SKU_service
SKUItem_router <-- SKUItem_service
Position_router <-- Position_service
TestDescriptor_router <-- TestDescriptor_service
TestResult_router <-- TestResult_service
User_router <-- User_service
RestockOrder_router <-- RestockOrder_service
ReturnOrder_router <-- ReturnOrder_service
InternalOrder_router <-- InternalOrder_service
Item_router <-- Item_service

SKU_service <-- SKU_DAO
SKU_service <-- TestDescriptor_DAO
SKU_service <-- Position_DAO
SKUItem_service <-- SKUItem_DAO
SKUItem_service <-- SKU_DAO
Position_service <-- Position_DAO
TestDescriptor_service <-- TestDescriptor_DAO
TestDescriptor_service <-- SKU_DAO
TestResult_service <-- TestResult_DAO
TestResult_service <-- TestDescriptor_DAO
TestResult_service <-- SKUItem_DAO
User_service <-- User_DAO
RestockOrder_service <-- RestockOrder_DAO
ReturnOrder_service <-- ReturnOrder_DAO
ReturnOrder_service <-- RestockOrder_DAO
InternalOrder_service <-- InternalOrder_DAO
Item_service <-- Item_DAO
Item_service <-- SKU_DAO

SKU_DAO <-- DatabaseConnection
SKUItem_DAO <-- DatabaseConnection
Position_DAO <-- DatabaseConnection
TestDescriptor_DAO <-- DatabaseConnection
TestResult_DAO <-- DatabaseConnection
User_DAO <-- DatabaseConnection
RestockOrder_DAO <-- DatabaseConnection
ReturnOrder_DAO <-- DatabaseConnection
InternalOrder_DAO <-- DatabaseConnection
Item_DAO <-- DatabaseConnection
```


# Integration approach

    <Write here the integration sequence you adopted, in general terms (top down, bottom up, mixed) and as sequence
    (ex: step1: class A, step 2: class A+B, step 3: class A+B+C, etc)> 
    <Some steps may  correspond to unit testing (ex step1 in ex above), presented in other document UnitTestReport.md>
    <One step will  correspond to API testing>
    

#  Integration Tests

   <define below a table for each integration step. For each integration step report the group of classes under test, and the names of
     Jest test cases applied to them, and the mock ups used, if any> Jest test cases should be here code/server/unit_test


## Step 1
| Classes  | mock up used |Jest test cases |
|--|--|--|
||||


## Step 2
| Classes  | mock up used |Jest test cases |
|--|--|--|
||||


## Step n 

   
| Classes  | mock up used |Jest test cases |
|--|--|--|
||||


# Coverage of Scenarios and FR

| Scenario ID | Functional Requirements covered | Mocha Test(s)                      |
| ----------- | ------------------------------- | ---------------------------------- |
| UC1         | FR2                             | testSKU.js                         |
| UC2         | FR3.1                           | testPosition.js                    |
| UC3         | FR5.1 - FR5.7                   | testRestockOrder.js                |
| UC4         | FR1                             | testUser.js                        |
| UC5.1       | FR5.8                           | testRestockOrder.js                |
| UC5.2       | FR5.8.2                         | testTestResult.js                  |
| UC5.3       | FR5.8                           | testSKUItem.js testRestockOrder.js |
| UC6         | FR5.9 - FR5.12                  | testReturnOrder.js                 |
| UC7         | FR1                             | testUser.js                        |
| UC9         | FR6.1 - FR6.7                   | testInternalOrder.js               |
| UC10        | FR6.8 - FR6.10                  | testInternalOrder.js               |
| UC11        | FR7                             | testItem.js                        |
| UC12        | FR3.2                           | testTestDescriptor.js              |


# Coverage of Non Functional Requirements

| Non Functional Requirement | Test name       |
| -------------------------- | --------------- |
| NFR4                       | testPosition.js |
| NFR6                       | testSKUItem.js testTestResult.js testRestockOrder.js testReturnOrder.js testInternalOrder.js | // TODO ricontrollare
| NRF9                       | testSKUItem.js testTestResult.js testRestockOrder.js testReturnOrder.js testInternalOrder.js | // TODO ricontrollare
