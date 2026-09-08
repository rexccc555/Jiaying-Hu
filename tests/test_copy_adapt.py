import unittest

from cutpost.copy_adapt import adapt_douyin, adapt_xiaohongshu, parse_tags


class CopyAdaptTests(unittest.TestCase):
    def test_parse_tags_mixed_separators(self):
        self.assertEqual(
            parse_tags("旅拍, vlog 周末去哪 #爬山"),
            ["旅拍", "vlog", "周末去哪", "爬山"],
        )

    def test_xhs_title_clipped(self):
        title = "这是一个明显超过二十个字的小红书标题还在继续"
        result = adapt_xiaohongshu(title, "正文", ["旅拍", "vlog"])
        self.assertEqual(len(result.title), 20)
        self.assertTrue(result.warnings)
        self.assertTrue(result.content_with_tags.endswith("#vlog"))

    def test_douyin_tag_limit(self):
        result = adapt_douyin("标题", "简介", ["a", "b", "c", "d", "e", "f"])
        self.assertEqual(result.tags, ["a", "b", "c", "d", "e"])
        self.assertTrue(any("话题" in w for w in result.warnings))


if __name__ == "__main__":
    unittest.main()
