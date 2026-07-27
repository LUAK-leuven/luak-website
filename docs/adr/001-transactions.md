# How we do transactions

> Status: Proposed

## Context

The LUAK website is built with Supabase, which is a great tool for quickly building applications. However, it doesn't support transactions when using the supabase-js client. This can lead to inconsistent state in the database if one of the operations fail.

This means that if we need transactions, we need a different approach.

## Decision

We decided to use stored procedures (Supabase functions) in the database to execute multiple operations in a single transaction (Option 1).

## Options

### Option 1: Use stored procedures in the database

Whenever we need to execute multiple operations in a single transaction, we can create a stored procedure in the database that executes all the operations in a single transaction.

This way we only need to call the stored procedure from the application.

**pros**:
- It is the easiest solution to execute multiple operations in a single transaction.

**cons**:
- The logic is now split between the application and the database, which can make it harder to maintain and understand.
- This approach only works for relatively simple operations.

### Option 2: Use edge functions to execute operations in a single transaction using a postgres client connected directly to the postgres database

**pros**:
- It allows to execute complex operations in a single transaction.

**cons**:
- It adds complexity to the application, as we need to maintain the edge functions.
- We need to use a postgres client connected directly to the postgres database, which can be more difficult to set up.

This is more complex than option 3 without aditional benefits, so it is not chosen.

### Option 3: Use a postgres client connected directly to the database in the server side of the application

**pros**:
- It allows to execute complex operations in a single transaction.

**cons**:
- We need to use a postgres client connected directly to the postgres database, which is more difficult to set up.
- Having two different ways to access the database can lead to confusion.
- This introduces security risks as the server is directly connected to the database.

This option is not chosen due to the additional complexity. But it can be considered in the future if we need to execute complex operations in a single transaction that cannot be easily implemented with stored procedures.

There are some nice postgres clients that allow transactions such as pg or drizzle-orm. I tried setting up drizzle-orm in the server and it worked. The drizzle API also fits quite well in the current system. But as mentioned before, it adds a lot of complexity to the application, so I decided to not use it for now.
