---
name: nestjs-feature
description: Use when adding a NestJS module, controller, provider, guard, or DTO.
---

# Add a NestJS feature

1. Generate the feature as its own module. Do not register the provider only in `AppModule`.
2. Add a DTO and make sure the global validation pipe whitelists fields.
3. Put HTTP mapping in the controller and the business rule in the service.
4. Inject the database or external client through the constructor. Do not construct it inside a method.
5. Protect the route with the existing auth guard. Load the current user with the project's decorator.
6. Throw an HTTP exception or a domain error the filter already maps.
7. Add a `TestingModule` test that mocks the service boundary and asserts status plus body.
