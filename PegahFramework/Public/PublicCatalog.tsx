﻿import * as React from 'react'
import { Link } from 'react-router-dom'
import { ajaxGet } from "@framework/Services"
import { Lite } from '@framework/Signum.Entities'
import { toNumberFormat } from '@framework/Reflection'
import * as AppContext from '@framework/AppContext'
import { useAPI } from '@framework/Hooks'
import { CatalogMessage, CategoryEntity, ProductEntity } from '../Products/PegahFramework.Products'
import { RegisterUserMessage } from './PegahFramework.Public'

export interface CategoryWithProducts {
  category: Lite<CategoryEntity>;
  picture: string;
  locCategoryName: string;
  locDescription: string;
  products: ProductEntity[];
}

export default function PublicCatalog(): React.JSX.Element {

  const categories = useAPI(() => ajaxGet<CategoryWithProducts[]>({ url: "/api/catalog" }), []);

  const maxDimensions: React.CSSProperties = { maxWidth: "96px", maxHeight: "96px" };

  const numberFormat = toNumberFormat("0.00");

  const result = (
    <div id="hero" style={{ background: "url(" + AppContext.toAbsoluteUrl("/background_dark.jpg") + ")", backgroundSize: "cover", backgroundAttachment: "fixed" }}>
      <div className="d-flex flex-column align-items-center position-relative">
          <h1 className="white mt-4">PegahFramework Product Catalog</h1>
          <Link to={AppContext.toAbsoluteUrl("/registerUser")} className="btn btn-primary">{RegisterUserMessage.Register.niceToString()}</Link>
        {categories && categories.map(c =>
          <div key={c.category.id} className="card shadow container m-4">
            <div className="card-body">
              <div className="media">
                {c.picture && <img className="d-flex me-3" style={maxDimensions} src={"data:image/jpeg;base64," + c.picture} />}
                <div className="media-body">
                  <h4 className="mt-0">{c.locCategoryName}</h4>
                  {c.locDescription}
                </div>
              </div>

              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>{CatalogMessage.ProductName.niceToString()}</th>
                    <th>{CatalogMessage.UnitPrice.niceToString()}</th>
                    <th>{CatalogMessage.QuantityPerUnit.niceToString()}</th>
                    <th>{CatalogMessage.UnitsInStock.niceToString()}</th>
                  </tr>
                </thead>
                <tbody>
                  {c.products.orderBy(a => a.id).orderBy(a => a.reorderLevel).map(p => <tr key={p.id}>
                    <td>{p.productName}</td>
                    <td>{numberFormat.format(p.unitPrice)} $</td>
                    <td>{p.quantityPerUnit}</td>
                    <td>{p.unitsInStock}</td>
                  </tr>)
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return result;
}

