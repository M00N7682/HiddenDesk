#!/usr/bin/env python3
"""
HiddenDesk Marketing Automation - 메인 스크립트

사용법:
    python main.py --help
    python main.py status              # 연결 상태 확인
    python main.py post --dry-run      # 테스트 (실제 전송 안함)
    python main.py post --live         # 실제 포스팅
    python main.py post --platform reddit --live  # Reddit만
"""
import argparse
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.prompt import Confirm

from config.settings import REDDIT, DISCORD_WEBHOOKS, TELEGRAM, HIDDENDESK_URL
from reddit.poster import RedditPoster, check_all_subreddits
from discord.poster import DiscordPoster
from telegram.poster import TelegramPoster

console = Console()


def check_status():
    """모든 플랫폼 연결 상태 확인"""
    table = Table(title="Platform Connection Status")
    table.add_column("Platform", style="cyan")
    table.add_column("Status", justify="center")
    table.add_column("Details")

    # Reddit
    reddit_ok = all([REDDIT["client_id"], REDDIT["client_secret"], REDDIT["username"]])
    if reddit_ok:
        try:
            poster = RedditPoster()
            if poster.reddit:
                table.add_row("Reddit", "[green]Connected", f"u/{poster.reddit.user.me()}")
            else:
                table.add_row("Reddit", "[red]Failed", "Connection failed")
        except Exception as e:
            table.add_row("Reddit", "[red]Error", str(e)[:50])
    else:
        table.add_row("Reddit", "[yellow]Not configured", "Set REDDIT_* in .env")

    # Discord
    discord_count = sum(1 for v in DISCORD_WEBHOOKS.values() if v)
    if discord_count > 0:
        table.add_row("Discord", "[green]Ready", f"{discord_count} webhook(s) configured")
    else:
        table.add_row("Discord", "[yellow]Not configured", "Set DISCORD_WEBHOOK_* in .env")

    # Telegram
    if TELEGRAM["bot_token"]:
        try:
            poster = TelegramPoster()
            info = poster.get_bot_info()
            if info.get("ok"):
                table.add_row("Telegram", "[green]Ready", f"@{info['result']['username']}")
            else:
                table.add_row("Telegram", "[red]Failed", info.get("description", "Unknown"))
        except Exception as e:
            table.add_row("Telegram", "[red]Error", str(e)[:50])
    else:
        table.add_row("Telegram", "[yellow]Not configured", "Set TELEGRAM_* in .env")

    console.print(table)
    console.print(f"\n[dim]Target URL: {HIDDENDESK_URL}[/dim]")


def run_post(platforms: list[str], dry_run: bool = True):
    """포스팅 실행"""
    if dry_run:
        console.print(Panel("[yellow]DRY RUN MODE - 실제 포스팅하지 않습니다[/yellow]", title="Mode"))
    else:
        console.print(Panel("[red]LIVE MODE - 실제 포스팅됩니다![/red]", title="Mode"))
        if not Confirm.ask("정말 실행하시겠습니까?"):
            console.print("[dim]취소됨[/dim]")
            return

    results = []

    # Reddit
    if "reddit" in platforms or "all" in platforms:
        console.print("\n[bold blue]== Reddit ==[/bold blue]")
        try:
            poster = RedditPoster()
            reddit_results = poster.post_hiddendesk_launch(dry_run=dry_run)
            results.extend(reddit_results)
        except Exception as e:
            console.print(f"[red]Reddit 에러: {e}[/red]")

    # Discord
    if "discord" in platforms or "all" in platforms:
        console.print("\n[bold blue]== Discord ==[/bold blue]")
        try:
            poster = DiscordPoster()
            discord_results = poster.post_hiddendesk_launch(dry_run=dry_run)
            results.extend(discord_results)
        except Exception as e:
            console.print(f"[red]Discord 에러: {e}[/red]")

    # Telegram
    if "telegram" in platforms or "all" in platforms:
        console.print("\n[bold blue]== Telegram ==[/bold blue]")
        try:
            poster = TelegramPoster()
            telegram_result = poster.post_hiddendesk_launch(dry_run=dry_run)
            results.append(telegram_result)
        except Exception as e:
            console.print(f"[red]Telegram 에러: {e}[/red]")

    # 결과 요약
    console.print("\n")
    summary_table = Table(title="Posting Summary")
    summary_table.add_column("Platform", style="cyan")
    summary_table.add_column("Status", justify="center")
    summary_table.add_column("Details")

    for r in results:
        status = "[green]Success" if r.get("success") else "[red]Failed"
        platform = r.get("subreddit", r.get("webhook", r.get("chat_id", "Unknown")))
        details = r.get("url", r.get("message", r.get("error", "")))[:60]
        summary_table.add_row(platform, status, details)

    console.print(summary_table)


def main():
    parser = argparse.ArgumentParser(
        description="HiddenDesk Marketing Automation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python main.py status              # Check connection status
    python main.py post --dry-run      # Test posting (no actual posts)
    python main.py post --live         # Actual posting
    python main.py post --platform reddit --dry-run  # Reddit only
        """,
    )

    subparsers = parser.add_subparsers(dest="command", help="Commands")

    # status command
    status_parser = subparsers.add_parser("status", help="Check platform connection status")

    # post command
    post_parser = subparsers.add_parser("post", help="Post to platforms")
    post_parser.add_argument(
        "--platform", "-p",
        choices=["all", "reddit", "discord", "telegram"],
        default="all",
        help="Platform to post to (default: all)",
    )
    post_parser.add_argument(
        "--dry-run",
        action="store_true",
        default=True,
        help="Test mode - don't actually post (default)",
    )
    post_parser.add_argument(
        "--live",
        action="store_true",
        help="Actually post to platforms",
    )

    # subreddits command
    subs_parser = subparsers.add_parser("subreddits", help="Check target subreddits")

    args = parser.parse_args()

    console.print(Panel.fit(
        "[bold green]HiddenDesk Marketing Automation[/bold green]",
        subtitle="회사에서 몰래 즐기는 게임",
    ))

    if args.command == "status":
        check_status()
    elif args.command == "post":
        dry_run = not args.live
        platforms = [args.platform]
        run_post(platforms, dry_run=dry_run)
    elif args.command == "subreddits":
        check_all_subreddits()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
