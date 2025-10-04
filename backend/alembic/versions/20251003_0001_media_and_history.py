from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20251003_0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")

    # donation_broadcast_participation
    op.create_table(
        'donation_broadcast_participation',
        sa.Column('id', sa.UUID(), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('donation_id', sa.UUID(), nullable=False),
        sa.Column('broadcast_id', sa.UUID(), nullable=False),
        sa.Column('joined_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('NOW()')),
    )
    op.create_unique_constraint('uq_dbp_user_donation_broadcast', 'donation_broadcast_participation', ['user_id', 'donation_id', 'broadcast_id'])
    op.create_index('idx_dbp_user_joined_at', 'donation_broadcast_participation', ['user_id', 'joined_at'], unique=False, postgresql_using=None)

    # media_assets
    op.create_table(
        'media_assets',
        sa.Column('id', sa.UUID(), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('owner_donation_id', sa.UUID(), nullable=True),
        sa.Column('broadcast_id', sa.UUID(), nullable=True),
        sa.Column('storage_key', sa.Text(), nullable=False),
        sa.Column('mime_type', sa.Text(), nullable=False),
        sa.Column('duration_seconds', sa.Integer(), nullable=True),
        sa.Column('width', sa.Integer(), nullable=True),
        sa.Column('height', sa.Integer(), nullable=True),
        sa.Column('size_bytes', sa.BigInteger(), nullable=True),
        sa.Column('status', sa.Text(), nullable=False),
        sa.Column('created_by', sa.UUID(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('reviewed_by', sa.UUID(), nullable=True),
        sa.Column('reviewed_at', sa.TIMESTAMP(timezone=True), nullable=True),
    )
    op.create_check_constraint('ck_media_assets_status', 'media_assets', "status IN ('uploaded','review','approved','rejected')")
    op.create_index('idx_media_assets_owner_status_created', 'media_assets', ['status', 'owner_donation_id', sa.text('created_at DESC')], unique=False)

    # media_delivery
    op.create_table(
        'media_delivery',
        sa.Column('id', sa.UUID(), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('donation_id', sa.UUID(), nullable=False),
        sa.Column('media_asset_id', sa.UUID(), nullable=False),
        sa.Column('delivered_by', sa.UUID(), nullable=True),
        sa.Column('delivered_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('NOW()')),
    )
    op.create_unique_constraint('uq_media_delivery_donation_asset', 'media_delivery', ['donation_id', 'media_asset_id'])
    op.create_index('idx_media_delivery_donation_delivered', 'media_delivery', ['donation_id', sa.text('delivered_at DESC')], unique=False)

    # media_packages
    op.create_table(
        'media_packages',
        sa.Column('id', sa.UUID(), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('donation_id', sa.UUID(), nullable=False),
        sa.Column('title', sa.Text(), nullable=False),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('status', sa.Text(), nullable=False),
        sa.Column('created_by', sa.UUID(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('published_at', sa.TIMESTAMP(timezone=True), nullable=True),
    )
    op.create_check_constraint('ck_media_packages_status', 'media_packages', "status IN ('draft','published')")

    # media_package_items
    op.create_table(
        'media_package_items',
        sa.Column('id', sa.UUID(), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('package_id', sa.UUID(), nullable=False),
        sa.Column('media_asset_id', sa.UUID(), nullable=False),
        sa.Column('position', sa.Integer(), nullable=False, server_default=sa.text('0')),
    )
    op.create_unique_constraint('uq_media_package_items_pkg_asset', 'media_package_items', ['package_id', 'media_asset_id'])


def downgrade() -> None:
    op.drop_constraint('uq_media_package_items_pkg_asset', 'media_package_items', type_='unique')
    op.drop_table('media_package_items')

    op.drop_constraint('ck_media_packages_status', 'media_packages', type_='check')
    op.drop_table('media_packages')

    op.drop_index('idx_media_delivery_donation_delivered', table_name='media_delivery')
    op.drop_constraint('uq_media_delivery_donation_asset', 'media_delivery', type_='unique')
    op.drop_table('media_delivery')

    op.drop_index('idx_media_assets_owner_status_created', table_name='media_assets')
    op.drop_constraint('ck_media_assets_status', 'media_assets', type_='check')
    op.drop_table('media_assets')

    op.drop_index('idx_dbp_user_joined_at', table_name='donation_broadcast_participation')
    op.drop_constraint('uq_dbp_user_donation_broadcast', 'donation_broadcast_participation', type_='unique')
    op.drop_table('donation_broadcast_participation')


