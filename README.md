# Entity Component System - Proof of Concept

## Description

Entity-Component-System is an architectural pattern that promotes code reusability by separating data from behavior. We have Entities, which are unique identifiers, Components, which are plain data objects without behavior (an entity is a collection of components), and Systems, which execute the business logic related to the entities and their components. If you want to learn more about ECS, I recommend the following [FAQ](https://github.com/SanderMertens/ecs-faq).

In this project, I made a small and simple ASCII game coded in TypeScript and implementing the ECS pattern. You can play it [HERE](https://angrypixel.gg/ecs-poc)

## Setup development environment

### Install dependencies

`yarn install`

### Run

`yarn start`

The dev environment will run in http://localhost:8080/
