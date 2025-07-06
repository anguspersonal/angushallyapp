import React from 'react';
import { IconBrandInstagram, IconBrandLinkedin, IconBrandGithub } from '@tabler/icons-react';
import { ActionIcon, Container, Group, Text } from '@mantine/core';
import classes from './Footer.module.css';

// TODO: Add a link to the privacy policy

function Footer() {
  const currentYear = new Date().getFullYear();
  
  // Use package version or build timestamp as build info
  const packageVersion = process.env.REACT_APP_VERSION;
  const buildTimestamp = process.env.REACT_APP_BUILD_TIMESTAMP;
  const gitCommit = process.env.REACT_APP_GIT_COMMIT;
  
  // Create build info from available data
  let buildInfo = null;
  if (packageVersion && gitCommit) {
    buildInfo = `v${packageVersion} (${gitCommit.substring(0, 7)})`;
  } else if (packageVersion) {
    buildInfo = `v${packageVersion}`;
  } else if (buildTimestamp) {
    buildInfo = new Date(buildTimestamp).toLocaleDateString();
  }
  
  return (
    <div className={classes.footer}>
      <Container className={classes.inner}>
        <div className={classes.leftSection}>
          <Text size="sm" c="dimmed">
            © {currentYear} Angus Hally. All rights reserved.
          </Text>
          {process.env.NODE_ENV === 'development' ? (
            <Text size="xs" c="dimmed">
              Development Environment
            </Text>
          ) : buildInfo ? (
            <Text size="xs" c="dimmed">
              Build: {buildInfo}
            </Text>
          ) : null}
        </div>
        <Group gap={0} className={classes.links} justify="flex-end" wrap="nowrap">
          <ActionIcon 
            size="lg" 
            color="gray" 
            variant="subtle"
            component="a"
            href="https://www.linkedin.com/in/angus-hally-9ab66a87/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconBrandLinkedin size={18} stroke={1.5} />
          </ActionIcon>
          <ActionIcon 
            size="lg" 
            color="gray" 
            variant="subtle"
            component="a"
            href="https://github.com/anguspersonal"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconBrandGithub size={18} stroke={1.5} />
          </ActionIcon>
          <ActionIcon 
            size="lg" 
            color="gray" 
            variant="subtle"
            component="a"
            href="https://www.instagram.com/hallyangus/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconBrandInstagram size={18} stroke={1.5} />
          </ActionIcon>
        </Group>
      </Container>
    </div>
  );
}

export default Footer;