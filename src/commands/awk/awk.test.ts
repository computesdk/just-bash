import { describe, it, expect } from 'vitest';
import { BashEnv } from '../../BashEnv.js';

describe('awk command', () => {
  describe('basic field access', () => {
    it('should print entire line with $0', async () => {
      const env = new BashEnv({
        files: { '/data.txt': 'hello world\nfoo bar\n' }
      });
      const result = await env.exec("awk '{print $0}' /data.txt");
      expect(result.stdout).toBe('hello world\nfoo bar\n');
      expect(result.exitCode).toBe(0);
    });

    it('should print first field with $1', async () => {
      const env = new BashEnv({
        files: { '/data.txt': 'hello world\nfoo bar\n' }
      });
      const result = await env.exec("awk '{print $1}' /data.txt");
      expect(result.stdout).toBe('hello\nfoo\n');
      expect(result.exitCode).toBe(0);
    });

    it('should print multiple fields', async () => {
      const env = new BashEnv({
        files: { '/data.txt': 'a b c\n1 2 3\n' }
      });
      const result = await env.exec("awk '{print $1, $3}' /data.txt");
      expect(result.stdout).toBe('a c\n1 3\n');
      expect(result.exitCode).toBe(0);
    });

    it('should handle missing fields gracefully', async () => {
      const env = new BashEnv({
        files: { '/data.txt': 'one\ntwo three\n' }
      });
      const result = await env.exec("awk '{print $2}' /data.txt");
      expect(result.stdout).toBe('\nthree\n');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('field separator -F', () => {
    it('should use custom field separator', async () => {
      const env = new BashEnv({
        files: { '/data.csv': 'a,b,c\n1,2,3\n' }
      });
      const result = await env.exec("awk -F',' '{print $2}' /data.csv");
      expect(result.stdout).toBe('b\n2\n');
      expect(result.exitCode).toBe(0);
    });

    it('should handle -F without space', async () => {
      const env = new BashEnv({
        files: { '/data.csv': 'a:b:c\n' }
      });
      const result = await env.exec("awk -F: '{print $2}' /data.csv");
      expect(result.stdout).toBe('b\n');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('variable assignment -v', () => {
    it('should use -v assigned variable', async () => {
      const env = new BashEnv({
        files: { '/data.txt': 'test\n' }
      });
      const result = await env.exec("awk -v name=World '{print \"Hello \" name}' /data.txt");
      expect(result.stdout).toBe('Hello World\n');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('built-in variables', () => {
    it('should track NR (record number)', async () => {
      const env = new BashEnv({
        files: { '/data.txt': 'a\nb\nc\n' }
      });
      const result = await env.exec("awk '{print NR, $0}' /data.txt");
      expect(result.stdout).toBe('1 a\n2 b\n3 c\n');
      expect(result.exitCode).toBe(0);
    });

    it('should track NF (number of fields)', async () => {
      const env = new BashEnv({
        files: { '/data.txt': 'one\ntwo three\na b c d\n' }
      });
      const result = await env.exec("awk '{print NF}' /data.txt");
      expect(result.stdout).toBe('1\n2\n4\n');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('BEGIN and END blocks', () => {
    it('should execute BEGIN block before processing', async () => {
      const env = new BashEnv({
        files: { '/data.txt': 'a\nb\n' }
      });
      const result = await env.exec("awk 'BEGIN{print \"start\"}{print $0}' /data.txt");
      expect(result.stdout).toBe('start\na\nb\n');
      expect(result.exitCode).toBe(0);
    });

    it('should execute END block after processing', async () => {
      const env = new BashEnv({
        files: { '/data.txt': 'a\nb\n' }
      });
      const result = await env.exec("awk '{print $0}END{print \"done\"}' /data.txt");
      expect(result.stdout).toBe('a\nb\ndone\n');
      expect(result.exitCode).toBe(0);
    });

    it('should execute BEGIN even with no input', async () => {
      const env = new BashEnv({
        files: { '/empty.txt': '' }
      });
      const result = await env.exec("awk 'BEGIN{print \"hello\"}' /empty.txt");
      expect(result.stdout).toBe('hello\n');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('pattern matching', () => {
    it('should filter lines with regex pattern', async () => {
      const env = new BashEnv({
        files: { '/data.txt': 'apple\nbanana\napricot\ncherry\n' }
      });
      const result = await env.exec("awk '/^a/{print}' /data.txt");
      expect(result.stdout).toBe('apple\napricot\n');
      expect(result.exitCode).toBe(0);
    });

    it('should match with NR condition', async () => {
      const env = new BashEnv({
        files: { '/data.txt': 'line1\nline2\nline3\n' }
      });
      const result = await env.exec("awk 'NR==2{print}' /data.txt");
      expect(result.stdout).toBe('line2\n');
      expect(result.exitCode).toBe(0);
    });

    it('should match with NR > condition', async () => {
      const env = new BashEnv({
        files: { '/data.txt': 'line1\nline2\nline3\n' }
      });
      const result = await env.exec("awk 'NR>1{print}' /data.txt");
      expect(result.stdout).toBe('line2\nline3\n');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('printf', () => {
    it('should format with printf %s', async () => {
      const env = new BashEnv({
        files: { '/data.txt': 'hello world\n' }
      });
      const result = await env.exec("awk '{printf \"%s!\\n\", $1}' /data.txt");
      expect(result.stdout).toBe('hello!\n');
      expect(result.exitCode).toBe(0);
    });

    it('should format with printf %d', async () => {
      const env = new BashEnv({
        files: { '/data.txt': '42\n' }
      });
      const result = await env.exec("awk '{printf \"num: %d\\n\", $1}' /data.txt");
      expect(result.stdout).toBe('num: 42\n');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('stdin input', () => {
    it('should read from piped stdin', async () => {
      const env = new BashEnv();
      const result = await env.exec("echo 'a b c' | awk '{print $2}'");
      expect(result.stdout).toBe('b\n');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should error on missing program', async () => {
      const env = new BashEnv();
      const result = await env.exec('awk');
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('missing program');
    });

    it('should error on missing file', async () => {
      const env = new BashEnv();
      const result = await env.exec("awk '{print}' /nonexistent.txt");
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('No such file');
    });

    it('should show help with --help', async () => {
      const env = new BashEnv();
      const result = await env.exec('awk --help');
      expect(result.stdout).toContain('awk');
      expect(result.stdout).toContain('pattern scanning');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('string concatenation', () => {
    it('should concatenate strings', async () => {
      const env = new BashEnv({
        files: { '/data.txt': 'hello world\n' }
      });
      const result = await env.exec("awk '{print $1 \"-\" $2}' /data.txt");
      expect(result.stdout).toBe('hello-world\n');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('arithmetic', () => {
    it('should perform addition', async () => {
      const env = new BashEnv({
        files: { '/data.txt': '10 20\n5 15\n' }
      });
      const result = await env.exec("awk '{print $1 + $2}' /data.txt");
      expect(result.stdout).toBe('30\n20\n');
      expect(result.exitCode).toBe(0);
    });
  });
});
