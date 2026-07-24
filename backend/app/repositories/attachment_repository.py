from sqlalchemy import select, update
from app.db.models import Attachment


async def create_attachment(db, user_id, kind, storage_path, **fields):
    row = Attachment(
        user_id=user_id, kind=kind, storage_path=storage_path, **fields
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return row


async def get_attachments(db, user_id, ids):
    """Fetch the caller's attachments by id (ignores anything not theirs)."""
    if not ids:
        return []
    result = await db.execute(
        select(Attachment).where(
            Attachment.id.in_(ids),
            Attachment.user_id == user_id,
            Attachment.hidden_at.is_(None),
        )
    )
    return result.scalars().all()


async def list_for_messages(db, user_id, message_ids):
    """All attachments belonging to a set of chat messages."""
    if not message_ids:
        return []
    result = await db.execute(
        select(Attachment)
        .where(
            Attachment.message_id.in_(message_ids),
            Attachment.user_id == user_id,
            Attachment.hidden_at.is_(None),
        )
        .order_by(Attachment.created_at)
    )
    return result.scalars().all()


async def link_to_message(db, user_id, ids, session_id, message_id):
    """Attach uploaded files to the message they were sent with."""
    if not ids:
        return
    await db.execute(
        update(Attachment)
        .where(Attachment.id.in_(ids), Attachment.user_id == user_id)
        .values(session_id=session_id, message_id=message_id)
    )
    await db.commit()
