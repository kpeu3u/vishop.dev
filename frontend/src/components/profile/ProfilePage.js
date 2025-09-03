import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Container, Row, Col, Nav, Tab } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import ChangePasswordForm from './ChangePasswordForm';
import EditProfileForm from './EditProfileForm';

const ProfilePage = observer(() => {
    const authStore = useAuth();

    return (
        <Container className="my-4">
            <Row>
                <Col>
                    <h1 className="display-5 mb-4">Profile Settings</h1>
                </Col>
            </Row>
            
            <Tab.Container defaultActiveKey="profile">
                <Row>
                    <Col lg={3} className="mb-4">
                        <Nav variant="pills" className="flex-column">
                            <Nav.Item>
                                <Nav.Link eventKey="profile" className="text-start">
                                    <i className="bi bi-person me-2"></i>
                                    Profile Information
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="password" className="text-start">
                                    <i className="bi bi-lock me-2"></i>
                                    Change Password
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Col>
                    
                    <Col lg={9}>
                        <Tab.Content>
                            <Tab.Pane eventKey="profile">
                                <EditProfileForm />
                            </Tab.Pane>
                            <Tab.Pane eventKey="password">
                                <ChangePasswordForm />
                            </Tab.Pane>
                        </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>
        </Container>
    );
});

export default ProfilePage;
