import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import FAQAccordion from '../FAQAccordion';

describe('FAQAccordion', () => {
  const items = [
    { question: 'How to adopt?', answer: 'Fill out the form.' },
    { question: 'What is sponsorship?', answer: 'Monthly support.' },
  ];

  it('renders all question headings', () => {
    render(<FAQAccordion items={items} />);
    expect(screen.getByText('How to adopt?')).toBeInTheDocument();
    expect(screen.getByText('What is sponsorship?')).toBeInTheDocument();
  });

  it('renders all answer texts', () => {
    render(<FAQAccordion items={items} />);
    expect(screen.getByText('Fill out the form.')).toBeInTheDocument();
    expect(screen.getByText('Monthly support.')).toBeInTheDocument();
  });

  it('renders nothing when items array is empty', () => {
    render(<FAQAccordion items={[]} />);
    expect(screen.queryByRole('heading', { level: 3 })).toBeNull();
  });

  it('renders title when provided', () => {
    render(<FAQAccordion items={items} title="FAQ Section" />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('FAQ Section');
  });

  it('does not render title heading when title is not provided', () => {
    render(<FAQAccordion items={items} />);
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
  });

  it('renders subtitle when title and subtitle are provided', () => {
    render(<FAQAccordion items={items} title="FAQ" subtitle="Common questions" />);
    expect(screen.getByText('Common questions')).toBeInTheDocument();
  });

  it('does not render subtitle when title is not provided', () => {
    render(<FAQAccordion items={items} subtitle="Common questions" />);
    expect(screen.queryByText('Common questions')).not.toBeInTheDocument();
  });

  it('expands accordion item when question button is clicked', async () => {
    render(<FAQAccordion items={items} />);

    const questionButton = screen.getByRole('button', { name: /How to adopt\?/ });
    const answerContainer = screen.getByText('Fill out the form.').closest('div[class*="grid"]');

    expect(answerContainer).toHaveClass('grid-rows-[0fr]');

    await userEvent.click(questionButton);

    expect(answerContainer).toHaveClass('grid-rows-[1fr]');
  });

  it('collapses accordion item when clicked again', async () => {
    render(<FAQAccordion items={items} />);

    const questionButton = screen.getByRole('button', { name: /How to adopt\?/ });
    const answerContainer = screen.getByText('Fill out the form.').closest('div[class*="grid"]');

    await userEvent.click(questionButton);
    expect(answerContainer).toHaveClass('grid-rows-[1fr]');

    await userEvent.click(questionButton);
    expect(answerContainer).toHaveClass('grid-rows-[0fr]');
  });

  it('allows multiple items to be open independently', async () => {
    render(<FAQAccordion items={items} />);

    const firstButton = screen.getByRole('button', { name: /How to adopt\?/ });
    const secondButton = screen.getByRole('button', { name: /What is sponsorship\?/ });

    await userEvent.click(firstButton);
    await userEvent.click(secondButton);

    const firstAnswerContainer = screen.getByText('Fill out the form.').closest('div[class*="grid"]');
    const secondAnswerContainer = screen.getByText('Monthly support.').closest('div[class*="grid"]');

    expect(firstAnswerContainer).toHaveClass('grid-rows-[1fr]');
    expect(secondAnswerContainer).toHaveClass('grid-rows-[1fr]');
  });
});
