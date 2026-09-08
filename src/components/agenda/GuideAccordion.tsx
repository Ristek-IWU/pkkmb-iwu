"use client";

import { Accordion, List, ThemeIcon } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

interface GuideSection {
  title: string;
  items: string[];
}

interface GuideAccordionProps {
  sections: GuideSection[];
}

export function GuideAccordion({ sections }: GuideAccordionProps) {
  return (
    <Accordion variant="contained" defaultValue={sections[0]?.title}>
      {sections.map((section) => (
        <Accordion.Item key={section.title} value={section.title}>
          <Accordion.Control>{section.title}</Accordion.Control>
          <Accordion.Panel>
            <List
              spacing="sm"
              size="sm"
              center
              icon={
                <ThemeIcon color="green" size={18} radius="xl" variant="light">
                  <IconCheck size={10} />
                </ThemeIcon>
              }
            >
              {section.items.map((item, index) => (
                <List.Item key={index}>{item}</List.Item>
              ))}
            </List>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
