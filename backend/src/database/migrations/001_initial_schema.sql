-- Create the database schema for Grades 1 and 3 TX and TM records

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Books table
CREATE TABLE books (
    book_code VARCHAR(20) PRIMARY KEY,
    learning_area VARCHAR(100) NOT NULL,
    grade_level INTEGER NOT NULL CHECK (grade_level >= 1 AND grade_level <= 12),
    publisher VARCHAR(200) NOT NULL,
    title VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL,
    is_new BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN (
        'For Evaluation',
        'For Revision',
        'For ROR',
        'For Finalization',
        'For FRR',
        'For Signing off',
        'NOT FOUND',
        'RETURNED',
        'In Progress'
    ))
);

-- Remarks table
CREATE TABLE remarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_code VARCHAR(20) NOT NULL REFERENCES books(book_code) ON DELETE CASCADE,
    text TEXT NOT NULL CHECK (length(text) <= 1000),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    -- Composite index for efficient book+timestamp queries
    CONSTRAINT unique_book_timestamp UNIQUE (book_code, timestamp)
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    token_version INTEGER DEFAULT 0,
    
    -- Constraints
    CONSTRAINT valid_role CHECK (role IN ('admin', 'editor', 'viewer'))
);

-- User Sessions table (for JWT blacklisting)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    
    CONSTRAINT unique_token UNIQUE (token_hash)
);

-- Audit log table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(50) NOT NULL,
    record_id VARCHAR(50) NOT NULL,
    operation VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes
    CONSTRAINT valid_operation CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE'))
);

-- Indexes for performance
CREATE INDEX idx_books_learning_area ON books(learning_area);
CREATE INDEX idx_books_grade_level ON books(grade_level);
CREATE INDEX idx_books_publisher ON books(publisher);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_created_at ON books(created_at DESC);
CREATE INDEX idx_books_search ON books USING gin(to_tsvector('english', learning_area || ' ' || publisher || ' ' || title));

-- Indexes for remarks
CREATE INDEX idx_remarks_book_code ON remarks(book_code);
CREATE INDEX idx_remarks_timestamp ON remarks(book_code, timestamp DESC);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Indexes for user sessions
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_revoked ON user_sessions(revoked_at);

-- Indexes for audit log
CREATE INDEX idx_audit_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_changed_by ON audit_log(changed_by);
CREATE INDEX idx_audit_changed_at ON audit_log(changed_at);

-- Composite indexes for common query patterns
CREATE INDEX idx_books_status_grade ON books(status, grade_level);
CREATE INDEX idx_books_publisher_grade ON books(publisher, grade_level);
CREATE INDEX idx_books_active ON books(created_at DESC) WHERE is_new = true;

-- Updated timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at columns
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_remarks_updated_at BEFORE UPDATE ON remarks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();