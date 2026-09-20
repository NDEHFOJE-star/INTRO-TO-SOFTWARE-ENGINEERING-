from text_processing_module import TextProcessingModule

module = TextProcessingModule()

print("=" * 60)
print("Testing full pipeline with typed text")
print("=" * 60)

cleaned = module.process_typed_text("   Hello    world!! \n\n\n  This is   a test.   ")
print("Cleaned:", repr(cleaned))

print()
print("=" * 60)
print("Pipeline test complete!")
print("=" * 60)