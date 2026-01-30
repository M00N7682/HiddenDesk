"""
Reddit 자동 포스팅 모듈
"""
import praw
from praw.exceptions import RedditAPIException
import time
from typing import Optional
from rich.console import Console
from rich.table import Table

import sys
sys.path.append('..')
from config.settings import REDDIT, TARGET_SUBREDDITS, TEMPLATES, HIDDENDESK_URL

console = Console()


class RedditPoster:
    def __init__(self):
        self.reddit = None
        self._connect()

    def _connect(self):
        """Reddit API 연결"""
        try:
            self.reddit = praw.Reddit(
                client_id=REDDIT["client_id"],
                client_secret=REDDIT["client_secret"],
                username=REDDIT["username"],
                password=REDDIT["password"],
                user_agent=REDDIT["user_agent"],
            )
            # 연결 확인
            console.print(f"[green]Reddit 연결 성공: u/{self.reddit.user.me()}[/green]")
        except Exception as e:
            console.print(f"[red]Reddit 연결 실패: {e}[/red]")
            self.reddit = None

    def check_subreddit_rules(self, subreddit_name: str) -> dict:
        """서브레딧 규칙 확인"""
        try:
            subreddit = self.reddit.subreddit(subreddit_name)
            rules = list(subreddit.rules)
            return {
                "name": subreddit.display_name,
                "subscribers": subreddit.subscribers,
                "rules_count": len(rules),
                "rules": [r.short_name for r in rules],
                "allows_links": subreddit.submission_type in ["any", "link"],
                "allows_self": subreddit.submission_type in ["any", "self"],
            }
        except Exception as e:
            return {"error": str(e)}

    def create_post(
        self,
        subreddit_name: str,
        title: str,
        body: str,
        flair: Optional[str] = None,
        is_self: bool = True,
        url: Optional[str] = None,
        dry_run: bool = True,
    ) -> dict:
        """
        포스트 생성

        Args:
            subreddit_name: 서브레딧 이름
            title: 제목
            body: 본문 (self post인 경우)
            flair: 플레어 (선택)
            is_self: True면 텍스트 포스트, False면 링크 포스트
            url: 링크 URL (is_self=False인 경우)
            dry_run: True면 실제 포스팅 안함 (테스트)
        """
        if not self.reddit:
            return {"success": False, "error": "Reddit not connected"}

        result = {
            "subreddit": subreddit_name,
            "title": title,
            "dry_run": dry_run,
        }

        if dry_run:
            console.print(f"\n[yellow]== DRY RUN (실제 포스팅 안함) ==[/yellow]")
            console.print(f"[cyan]Subreddit:[/cyan] r/{subreddit_name}")
            console.print(f"[cyan]Title:[/cyan] {title}")
            console.print(f"[cyan]Body:[/cyan]\n{body[:500]}...")
            result["success"] = True
            result["message"] = "Dry run completed"
            return result

        try:
            subreddit = self.reddit.subreddit(subreddit_name)

            if is_self:
                submission = subreddit.submit(
                    title=title,
                    selftext=body,
                    flair_id=flair,
                )
            else:
                submission = subreddit.submit(
                    title=title,
                    url=url or HIDDENDESK_URL,
                    flair_id=flair,
                )

            result["success"] = True
            result["url"] = f"https://reddit.com{submission.permalink}"
            result["id"] = submission.id
            console.print(f"[green]포스팅 성공: {result['url']}[/green]")

        except RedditAPIException as e:
            result["success"] = False
            result["error"] = str(e)
            console.print(f"[red]Reddit API 에러: {e}[/red]")

        except Exception as e:
            result["success"] = False
            result["error"] = str(e)
            console.print(f"[red]에러: {e}[/red]")

        return result

    def post_to_multiple(
        self,
        subreddits: list[str],
        title: str,
        body: str,
        delay_seconds: int = 600,  # 10분 간격 (스팸 방지)
        dry_run: bool = True,
    ) -> list[dict]:
        """여러 서브레딧에 순차 포스팅"""
        results = []

        for i, sub in enumerate(subreddits):
            console.print(f"\n[bold]({i+1}/{len(subreddits)}) r/{sub} 포스팅 중...[/bold]")

            result = self.create_post(
                subreddit_name=sub,
                title=title,
                body=body,
                dry_run=dry_run,
            )
            results.append(result)

            # 마지막이 아니면 대기
            if not dry_run and i < len(subreddits) - 1:
                console.print(f"[dim]다음 포스팅까지 {delay_seconds}초 대기...[/dim]")
                time.sleep(delay_seconds)

        return results

    def post_hiddendesk_launch(self, dry_run: bool = True) -> list[dict]:
        """HiddenDesk 런칭 포스트"""
        template = TEMPLATES["reddit_launch"]

        return self.post_to_multiple(
            subreddits=TARGET_SUBREDDITS,
            title=template["title"],
            body=template["body"].format(url=HIDDENDESK_URL),
            dry_run=dry_run,
        )


def check_all_subreddits():
    """모든 타겟 서브레딧 규칙 확인"""
    poster = RedditPoster()

    table = Table(title="Target Subreddits Analysis")
    table.add_column("Subreddit", style="cyan")
    table.add_column("Subscribers", justify="right")
    table.add_column("Self Posts", justify="center")
    table.add_column("Link Posts", justify="center")
    table.add_column("Rules", justify="right")

    for sub in TARGET_SUBREDDITS:
        info = poster.check_subreddit_rules(sub)
        if "error" not in info:
            table.add_row(
                f"r/{info['name']}",
                f"{info['subscribers']:,}",
                "Yes" if info['allows_self'] else "No",
                "Yes" if info['allows_links'] else "No",
                str(info['rules_count']),
            )
        else:
            table.add_row(f"r/{sub}", "Error", "-", "-", info['error'])

    console.print(table)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Reddit Poster for HiddenDesk")
    parser.add_argument("--check", action="store_true", help="서브레딧 규칙 확인")
    parser.add_argument("--post", action="store_true", help="포스팅 실행")
    parser.add_argument("--live", action="store_true", help="실제 포스팅 (기본: dry-run)")

    args = parser.parse_args()

    if args.check:
        check_all_subreddits()
    elif args.post:
        poster = RedditPoster()
        poster.post_hiddendesk_launch(dry_run=not args.live)
    else:
        parser.print_help()
