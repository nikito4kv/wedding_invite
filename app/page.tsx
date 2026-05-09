'use client';

import { CalendarSection } from '@/components/calendar/calendar-section';
import { GuestChatSection } from '@/components/chat/guest-chat-section';
import { CountdownSection } from '@/components/countdown/countdown-section';
import { FaqSection } from '@/components/faq/faq-section';
import { HeroSection } from '@/components/hero/hero-section';
import { MusicExperience } from '@/components/music';
import { OrganizerSection } from '@/components/organizer/organizer-section';
import { RsvpSection } from '@/components/rsvp';
import { ImportantBlock } from '@/components/schedule/important-block';
import { PartyFormatBlock } from '@/components/schedule/party-format-block';
import { ScheduleSection } from '@/components/schedule/schedule-section';
import { VenueSection } from '@/components/venue/venue-section';
import { useInviteContent, useLocaleUi } from '@/lib/i18n/locale-context';

const storyGridStyle = {
  display: 'grid',
  gap: 'var(--section-gap)',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 18rem), 1fr))'
} as const;

const storyColumnStyle = {
  display: 'grid',
  alignContent: 'stretch',
  gap: 'var(--section-gap)',
  gridTemplateRows: 'auto minmax(0, 1fr)',
  height: '100%'
} as const;

export default function HomePage() {
  const initialNowTimestampMs = Date.now();
  const inviteContent = useInviteContent();
  const ui = useLocaleUi();

  return (
    <MusicExperience
      audioPath={inviteContent.assets.audio.path}
      audioTitle={inviteContent.assets.audio.title}
    >
      <main aria-label={ui.mainAria} className="page-shell" id="main-content">
        <HeroSection />

        <section className="details-section" aria-labelledby="story-title">
          <div className="content-frame section-stack">
            <div className="details-section__header content-frame content-frame--narrow section-stack">
              <div>
                <h2 id="story-title">{ui.detailsTitle}</h2>
              </div>
            </div>

            <div style={storyGridStyle}>
              <CountdownSection initialNowTimestampMs={initialNowTimestampMs} />
              <CalendarSection />
            </div>

            <div style={storyGridStyle}>
              <PartyFormatBlock />
              <div style={storyColumnStyle}>
                <ScheduleSection />
                <ImportantBlock />
              </div>
            </div>
          </div>
        </section>

        <VenueSection />
        <RsvpSection />
        <OrganizerSection />
        <GuestChatSection />
        <FaqSection />
      </main>
    </MusicExperience>
  );
}
