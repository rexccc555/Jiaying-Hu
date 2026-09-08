import unittest

from cutpost.labels import api_error_message, status_label
from cutpost.media import classify_names


class MediaTests(unittest.TestCase):
    def test_reject_mix(self):
        result = classify_names(["a.mp4", "b.jpg"])
        self.assertIsNotNone(result["error"])
        self.assertIn("分开发", result["error"])

    def test_one_video(self):
        result = classify_names(["final.mp4"])
        self.assertIsNone(result["error"])
        self.assertEqual(result["videos"], ["final.mp4"])

    def test_reject_unknown(self):
        result = classify_names(["note.txt"])
        self.assertIn("不支持", result["error"])


class LabelTests(unittest.TestCase):
    def test_status_label(self):
        self.assertEqual(status_label("preview_ready"), "待你确认")

    def test_fastapi_detail_string(self):
        self.assertEqual(api_error_message({"detail": "请先预览"}), "请先预览")

    def test_fastapi_detail_list(self):
        self.assertEqual(
            api_error_message({"detail": [{"msg": "标题不能为空"}]}),
            "标题不能为空",
        )


if __name__ == "__main__":
    unittest.main()
