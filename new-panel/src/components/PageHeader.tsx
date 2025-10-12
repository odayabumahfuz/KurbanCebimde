import React from 'react'
import { Link } from 'react-router-dom'

type BreadcrumbItem = { label: string; href?: string }

const PageHeader: React.FC<{ title: string; subtitle?: string; breadcrumbs?: BreadcrumbItem[]; actionsRight?: React.ReactNode }> = ({ title, subtitle, breadcrumbs, actionsRight }) => (
  <div className="page-header mb-3">
    <div className="d-flex align-items-center justify-content-between gap-3">
      <div className="min-w-0">
        {breadcrumbs && (
          <nav aria-label="breadcrumb" className="mb-2">
            <ol className="breadcrumb mb-0">
              {breadcrumbs.map((bc,i)=> (
                <li key={i} className={`breadcrumb-item ${i===breadcrumbs.length-1? 'active':''}`} aria-current={i===breadcrumbs.length-1? 'page': undefined}>
                  {bc.href && i!==breadcrumbs.length-1 ? <Link to={bc.href} className="text-decoration-none">{bc.label}</Link> : <span>{bc.label}</span>}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="h4 fw-semibold text-truncate mb-1">{title}</h1>
        {subtitle && <p className="text-muted mb-0 text-truncate-1">{subtitle}</p>}
      </div>
      {actionsRight && <div className="d-flex align-items-center gap-2 flex-shrink-0">{actionsRight}</div>}
    </div>
  </div>
)

export default PageHeader


