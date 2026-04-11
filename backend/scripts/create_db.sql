USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'nova_store')
BEGIN
    CREATE DATABASE nova_store;
    PRINT 'Database nova_store created.';
END
ELSE
BEGIN
    PRINT 'Database nova_store already exists. Skipping.';
END
GO
