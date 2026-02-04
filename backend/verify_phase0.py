#!/usr/bin/env python3
"""
Verification script for Phase 0 implementation
Tests parser and schema functionality without external dependencies
"""

import json
from datetime import datetime
from app.schemas.conversations import Platform, ConversationCreate
from app.services.principles.parser import ConversationParser
from app.schemas.principles import PrincipleCreate


def test_schemas():
    """Test schema instantiation"""
    print("Testing schemas...")

    # Test conversation schema
    conv = ConversationCreate(
        platform=Platform.CLAUDE,
        external_id="test-123",
        title="Test Conversation",
        content="user: Test\nassistant: Response",
        metadata={"model": "claude-3"},
        conversation_date=datetime.now()
    )
    assert conv.platform == Platform.CLAUDE
    print("  ✓ ConversationCreate schema")

    # Test principle schema
    principle = PrincipleCreate(
        content="Always verify implementation",
        category="verification"
    )
    assert principle.content == "Always verify implementation"
    print("  ✓ PrincipleCreate schema")

    return True


def test_parser():
    """Test conversation parser"""
    print("\nTesting conversation parser...")
    parser = ConversationParser()

    # Test Claude parser
    claude_export = json.dumps({
        "uuid": "claude-123",
        "name": "Claude Test",
        "created_at": "2024-01-01T10:00:00Z",
        "model": "claude-3-sonnet",
        "chat_messages": [
            {"sender": "user", "text": "What is simplicity?"},
            {"sender": "assistant", "text": "Simplicity is about clarity and focus."}
        ]
    })

    claude_convs = parser.parse(Platform.CLAUDE, claude_export)
    assert len(claude_convs) == 1
    assert claude_convs[0].platform == Platform.CLAUDE
    assert claude_convs[0].external_id == "claude-123"
    assert "user:" in claude_convs[0].content
    print("  ✓ Claude parser")

    # Test ChatGPT parser
    chatgpt_export = json.dumps({
        "id": "chatgpt-456",
        "title": "ChatGPT Test",
        "create_time": 1704103200,
        "model": "gpt-4",
        "mapping": {
            "1": {
                "message": {
                    "author": {"role": "user"},
                    "content": {"parts": ["Tell me about pragmatism"]}
                }
            },
            "2": {
                "message": {
                    "author": {"role": "assistant"},
                    "content": {"parts": ["Pragmatism is about practical results."]}
                }
            }
        }
    })

    chatgpt_convs = parser.parse(Platform.CHATGPT, chatgpt_export)
    assert len(chatgpt_convs) == 1
    assert chatgpt_convs[0].platform == Platform.CHATGPT
    assert chatgpt_convs[0].external_id == "chatgpt-456"
    print("  ✓ ChatGPT parser")

    # Test Gemini parser
    gemini_export = json.dumps({
        "id": "gemini-789",
        "title": "Gemini Test",
        "timestamp": 1704189600,
        "turns": [
            {"role": "user", "text": "What is efficiency?"},
            {"role": "assistant", "text": "Efficiency is doing more with less."}
        ]
    })

    gemini_convs = parser.parse(Platform.GEMINI, gemini_export)
    assert len(gemini_convs) == 1
    assert gemini_convs[0].platform == Platform.GEMINI
    print("  ✓ Gemini parser")

    return True


def test_date_parsing():
    """Test various date format handling"""
    print("\nTesting date parsing...")
    parser = ConversationParser()

    # Test timestamp
    ts = 1704067200
    date1 = parser._parse_date(ts)
    assert date1 is not None
    print("  ✓ Unix timestamp")

    # Test ISO string
    iso = "2024-01-01T10:00:00Z"
    date2 = parser._parse_date(iso)
    assert date2 is not None
    print("  ✓ ISO 8601 string")

    # Test None
    date3 = parser._parse_date(None)
    assert date3 is None
    print("  ✓ None handling")

    return True


def test_message_extraction():
    """Test message extraction from various formats"""
    print("\nTesting message extraction...")
    parser = ConversationParser()

    # Test with chat_messages
    item1 = {
        "chat_messages": [
            {"sender": "user", "text": "Hello"},
            {"sender": "assistant", "text": "Hi"}
        ]
    }
    content1 = parser._extract_messages(item1)
    assert "user:" in content1
    assert "assistant:" in content1
    print("  ✓ chat_messages format")

    # Test with messages
    item2 = {
        "messages": [
            {"role": "user", "content": "Hello"},
            {"role": "assistant", "content": "Hi"}
        ]
    }
    content2 = parser._extract_messages(item2)
    assert len(content2) > 0
    print("  ✓ messages format")

    # Test fallback to content
    item3 = {"content": "Plain text content"}
    content3 = parser._extract_messages(item3)
    assert content3 == "Plain text content"
    print("  ✓ content fallback")

    return True


def main():
    """Run all tests"""
    print("=" * 60)
    print("Phase 0 Implementation Verification")
    print("=" * 60)

    try:
        test_schemas()
        test_parser()
        test_date_parsing()
        test_message_extraction()

        print("\n" + "=" * 60)
        print("ALL TESTS PASSED ✓")
        print("=" * 60)
        print("\nPhase 0 implementation is ready!")
        print("\nNext steps:")
        print("1. Set up Supabase tables (see PHASE0_IMPLEMENTATION.md)")
        print("2. Configure ANTHROPIC_API_KEY in .env")
        print("3. Run: uvicorn app.main:app --reload")
        print("4. Test import endpoint: POST /api/v1/conversations/import")
        print("5. Test extraction: POST /api/v1/principles/extract")

        return 0

    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        return 1
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit(main())
