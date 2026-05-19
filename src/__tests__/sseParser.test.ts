import { expect, test } from 'bun:test';
import { parseSseBuffer, type SseEvent } from '../utils/sseParser';

test('should extract delta events from SSE buffer', () => {
  const buffer =
    'data: {"type":"delta","text":"const"}\n\ndata: {"type":"delta","text":" Button"}\n\n';
  const { events, remainder } = parseSseBuffer(buffer);
  expect(events).toHaveLength(2);
  expect(events[0]).toEqual({ type: 'delta', text: 'const' });
  expect(events[1]).toEqual({ type: 'delta', text: ' Button' });
  expect(remainder).toBe('');
});

test('should return remainder for incomplete chunk', () => {
  const buffer = 'data: {"type":"delta","text":"const"}';
  const { events, remainder } = parseSseBuffer(buffer);
  expect(events).toHaveLength(0);
  expect(remainder).toBe(buffer);
});

test('should handle multiple complete events with remainder', () => {
  const buffer =
    'data: {"type":"delta","text":"a"}\n\ndata: {"type":"delta","text":"b"}\n\ndata: {"type":"delta","text":"c"}';
  const { events, remainder } = parseSseBuffer(buffer);
  expect(events).toHaveLength(2);
  expect(remainder).toBe('data: {"type":"delta","text":"c"}');
});

test('should handle done event', () => {
  const buffer =
    'data: {"type":"delta","text":"code"}\n\ndata: {"type":"done","code":"const A = () => <button/>;\\n\\nrender(<A />);"}\n\n';
  const { events } = parseSseBuffer(buffer);
  expect(events).toHaveLength(2);
  expect(events[1].type).toBe('done');
  expect(events[1].code).toContain('render');
});

test('should handle error event', () => {
  const buffer = 'data: {"type":"error","message":"API key invalid"}\n\n';
  const { events } = parseSseBuffer(buffer);
  expect(events).toHaveLength(1);
  expect(events[0].type).toBe('error');
  expect(events[0].message).toBe('API key invalid');
});

test('should skip malformed JSON', () => {
  const buffer =
    'data: {"type":"delta","text":"valid"}\n\ndata: invalid json\n\ndata: {"type":"delta","text":"another"}\n\n';
  const { events } = parseSseBuffer(buffer);
  expect(events).toHaveLength(2);
  expect(events[0].text).toBe('valid');
  expect(events[1].text).toBe('another');
});
