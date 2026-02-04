-- Vibecoding 아젠다 및 소스 시드 데이터

-- Vibecoding 아젠다 생성
INSERT INTO agendas (id, name, description, category, is_active) VALUES
(gen_random_uuid(), 'vibecoding', 'AI 코딩 도구 트렌드 모니터링', 'ai-coding', true);

-- 아젠다 ID 참조를 위한 블록
DO $$
DECLARE
  agenda_uuid UUID;
BEGIN
  SELECT id INTO agenda_uuid FROM agendas WHERE name = 'vibecoding';

  -- RSS 소스: AI 관련 뉴스
  INSERT INTO sources (id, agenda_id, name, source_type, url, config, is_active) VALUES
  (gen_random_uuid(), agenda_uuid, 'Anthropic Blog', 'rss', 'https://www.anthropic.com/feed', '{}', true),
  (gen_random_uuid(), agenda_uuid, 'OpenAI Blog', 'rss', 'https://openai.com/blog/rss', '{}', true),
  (gen_random_uuid(), agenda_uuid, 'Hacker News AI', 'rss', 'https://hnrss.org/newest?q=AI+coding', '{"keywords": ["AI", "coding", "LLM"]}', true);

  -- GitHub 소스: 주요 AI 코딩 도구 릴리즈
  INSERT INTO sources (id, agenda_id, name, source_type, url, config, is_active) VALUES
  (gen_random_uuid(), agenda_uuid, 'Cursor Releases', 'github', 'https://github.com/getcursor/cursor', '{"repo": "getcursor/cursor"}', true),
  (gen_random_uuid(), agenda_uuid, 'Continue Dev', 'github', 'https://github.com/continuedev/continue', '{"repo": "continuedev/continue"}', true),
  (gen_random_uuid(), agenda_uuid, 'Aider Releases', 'github', 'https://github.com/paul-gauthier/aider', '{"repo": "paul-gauthier/aider"}', true);

END $$;

-- 검증 쿼리:
-- SELECT * FROM agendas WHERE name = 'vibecoding';
-- SELECT name, source_type, is_active FROM sources;
