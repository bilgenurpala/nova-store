-- Run this script in SQL Server Management Studio (SSMS)
-- or with sqlcmd against your SQL Server instance.
--
-- Usage (sqlcmd):
--   sqlcmd -S localhost -U sa -P your_password -i create_db.sql

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
