import { Linking, Text, View } from 'react-native';
import * as React from 'react';

import { Typography } from '@/components/ui/typography';

function renderInline(text: string) {
  let key = 0;

  const parse = (input: string): React.ReactNode[] => {
    const nodes: React.ReactNode[] = [];
    let i = 0;

    const pushText = (value: string) => {
      if (!value) return;
      nodes.push(<Text key={`txt-${key++}`}>{value}</Text>);
    };

    while (i < input.length) {
      // [label](url) with nested inline formatting inside label
      if (input[i] === '[') {
        const labelEnd = input.indexOf(']', i + 1);
        if (labelEnd > -1 && input[labelEnd + 1] === '(') {
          const hrefEnd = input.indexOf(')', labelEnd + 2);
          if (hrefEnd > -1) {
            const label = input.slice(i + 1, labelEnd);
            const href = input.slice(labelEnd + 2, hrefEnd);
            nodes.push(
              <Text
                key={`lnk-${key++}`}
                style={{ color: '#0284c7', textDecorationLine: 'underline' }}
                onPress={() => {
                  void Linking.openURL(href);
                }}
              >
                {parse(label)}
              </Text>,
            );
            i = hrefEnd + 1;
            continue;
          }
        }
      }

      // <u>underlined</u>
      if (input.startsWith('<u>', i)) {
        const end = input.indexOf('</u>', i + 3);
        if (end > -1) {
          const inner = input.slice(i + 3, end);
          nodes.push(
            <Text key={`u-${key++}`} style={{ textDecorationLine: 'underline' }}>
              {parse(inner)}
            </Text>,
          );
          i = end + 4;
          continue;
        }
      }

      // **bold**
      if (input.startsWith('**', i)) {
        const end = input.indexOf('**', i + 2);
        if (end > -1) {
          const inner = input.slice(i + 2, end);
          nodes.push(
            <Text key={`b-${key++}`} style={{ fontWeight: '700' }}>
              {parse(inner)}
            </Text>,
          );
          i = end + 2;
          continue;
        }
      }

      // *italic*
      if (input[i] === '*') {
        const end = input.indexOf('*', i + 1);
        if (end > -1) {
          const inner = input.slice(i + 1, end);
          nodes.push(
            <Text key={`i-${key++}`} style={{ fontStyle: 'italic' }}>
              {parse(inner)}
            </Text>,
          );
          i = end + 1;
          continue;
        }
      }

      // `code`
      if (input[i] === '`') {
        const end = input.indexOf('`', i + 1);
        if (end > -1) {
          const inner = input.slice(i + 1, end);
          nodes.push(
            <Text key={`c-${key++}`} style={{ backgroundColor: '#e2e8f0', color: '#0f172a' }}>
              {inner}
            </Text>,
          );
          i = end + 1;
          continue;
        }
      }

      const nextSpecial = (() => {
        const candidates = [
          input.indexOf('[', i + 1),
          input.indexOf('<u>', i + 1),
          input.indexOf('**', i + 1),
          input.indexOf('*', i + 1),
          input.indexOf('`', i + 1),
        ].filter((idx) => idx > -1);
        return candidates.length ? Math.min(...candidates) : -1;
      })();

      if (nextSpecial === -1) {
        pushText(input.slice(i));
        i = input.length;
      } else {
        pushText(input.slice(i, nextSpecial));
        i = nextSpecial;
      }
    }

    return nodes;
  };

  return parse(text);
}

export function MdxViewer({ content }: { content: string }) {
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i] ?? '';
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !(lines[i] ?? '').trim().startsWith('```')) {
        codeLines.push(lines[i] ?? '');
        i += 1;
      }
      i += 1;
      blocks.push(
        <View key={`code-${key++}`} className="mb-3 rounded-xl bg-slate-900 px-3 py-3">
          <Typography className="font-mono text-sm leading-6 text-slate-100">
            {codeLines.join('\n')}
          </Typography>
        </View>,
      );
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = heading[1]!.length;
      const variant = level <= 1 ? 'h3' : level === 2 ? 'h4' : level === 3 ? 'h5' : 'h6';
      blocks.push(
        <Typography key={`h-${key++}`} variant={variant} className="mb-2 mt-1">
          {heading[2]}
        </Typography>,
      );
      i += 1;
      continue;
    }

    if (trimmed === '---') {
      blocks.push(<View key={`hr-${key++}`} className="mb-3 mt-1 h-px bg-border" />);
      i += 1;
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i] ?? '')) {
        items.push((lines[i] ?? '').replace(/^\s*[-*+]\s+/, ''));
        i += 1;
      }
      blocks.push(
        <View key={`ul-${key++}`} className="mb-3 gap-1">
          {items.map((item, idx) => (
            <Typography key={`uli-${idx}`} className="text-base leading-7 text-foreground">
              {'\u2022'} {renderInline(item)}
            </Typography>
          ))}
        </View>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i] ?? '')) {
        items.push((lines[i] ?? '').replace(/^\d+\.\s+/, ''));
        i += 1;
      }
      blocks.push(
        <View key={`ol-${key++}`} className="mb-3 gap-1">
          {items.map((item, idx) => (
            <Typography key={`oli-${idx}`} className="text-base leading-7 text-foreground">
              {idx + 1}. {renderInline(item)}
            </Typography>
          ))}
        </View>,
      );
      continue;
    }

    if (!trimmed) {
      i += 1;
      continue;
    }

    let paragraph = line;
    i += 1;
    while (
      i < lines.length &&
      (lines[i] ?? '').trim() &&
      !/^(#{1,6})\s+/.test(lines[i] ?? '') &&
      !/^\s*[-*+]\s+/.test(lines[i] ?? '') &&
      !/^\d+\.\s+/.test(lines[i] ?? '') &&
      !(lines[i] ?? '').trim().startsWith('```') &&
      (lines[i] ?? '').trim() !== '---'
    ) {
      paragraph += ` ${lines[i] ?? ''}`;
      i += 1;
    }
    blocks.push(
      <Typography key={`p-${key++}`} className="mb-3 text-base leading-7 text-foreground">
        {renderInline(paragraph)}
      </Typography>,
    );
  }

  return <View>{blocks}</View>;
}
