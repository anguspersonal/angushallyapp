'use client';

import * as React from 'react';
import { Button } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import styles from './ResumeWindow.module.css';

const RESUME_URL = '/resume.pdf';
const RESUME_DOWNLOAD_NAME = 'Angus-Hally-Resume.pdf';

/**
 * Resume window — embeds the PDF for in-window preview and exposes an explicit
 * Download button that triggers a file save (via HTML5 `download` attribute).
 *
 * The PDF itself lives at `/public/resume.pdf` and is served by Next as
 * `/resume.pdf`. If the file is missing, the iframe shows the browser's
 * default 404 — drop a PDF in `public/resume.pdf` to wire it up.
 */
export function ResumeWindow() {
  return (
    <div className={styles.root}>
      <header className={styles.toolbar}>
        <span className={styles.filename}>{RESUME_DOWNLOAD_NAME}</span>
        <Button
          component="a"
          href={RESUME_URL}
          download={RESUME_DOWNLOAD_NAME}
          variant="filled"
          size="xs"
          leftSection={<IconDownload size={14} stroke={2} />}
          className={styles.downloadButton}
        >
          Download
        </Button>
      </header>

      <iframe
        src={RESUME_URL}
        className={styles.viewer}
        title="Angus Hally — Resume (PDF preview)"
        loading="lazy"
      />
    </div>
  );
}

export default ResumeWindow;
