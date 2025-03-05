using Signum.Authorization;
using PegahFramework.Customers;
using PegahFramework.Orders;
using PegahFramework.Products;

namespace PegahFramework.Test.React;

public class OrderReactTest : PegahFrameworkTestClass
{
    public OrderReactTest()
    {
        PegahFrameworkEnvironment.StartAndInitialize();
        AuthLogic.GloballyEnabled = false;
    }

    [Fact]
    public void OrderWebTestExample()
    {
        Browse("Standard", b =>
        {
            Lite<OrderEntity>? lite = null;
            try
            {
                b.SearchPage(typeof(PersonEntity)).Using(persons =>
                {
                    persons.Search();
                    persons.SearchControl.Results.OrderBy("Id");
                    return persons.Results.EntityClick<PersonEntity>(1);
                }).Using(john =>
                {
                    using (FrameModalProxy<OrderEntity> order = john.ConstructFrom(OrderOperation.CreateOrderFromCustomer))
                    {
                        order.AutoLineValue(a => a.ShipName, Guid.NewGuid().ToString());
                        order.EntityCombo(a => a.ShipVia).SelectLabel("FedEx");

                        ProductEntity sonicProduct = Database.Query<ProductEntity>().SingleEx(p => p.ProductName.Contains("Sonic"));

                        var line = order.EntityDetail(a => a.Details).GetOrCreateDetailControl<OrderDetailEmbedded>();
                        line.EntityLineValue(a => a.Product, sonicProduct.ToLite());

                        Assert.Equal(sonicProduct.UnitPrice, order.AutoLineValue(a => a.TotalPrice));

                        order.Execute(OrderOperation.Save);

                        lite = order.GetLite();

                        Assert.Equal(sonicProduct.UnitPrice, order.AutoLineValue(a => a.TotalPrice));
                    }

                    return b.NormalPage(lite);

                }).EndUsing(order =>
                {
                    Assert.Equal(lite!.InDB(a => a.TotalPrice), order.AutoLineValue(a => a.TotalPrice));
                });
            }
            finally
            {
                if (lite != null)
                    lite.Delete();
            }
        });
    }//OrderReactTestExample
}
